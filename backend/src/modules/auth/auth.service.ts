// Auth service — implements all four authentication flows for CropCare.
//
// Design refs:
//   architecture/07_Architecture.md §2.5 — service layer responsibilities
//   architecture/06_API_Design.md §1    — endpoint contracts
//   architecture/05_Database.md §2.1–2.3 — users / dealers / admins tables
//
// Key points:
//   • Farmers use demo (phone-number) login — no password, no OTP in this phase.
//   • Dealers and admins use email+bcrypt password login.
//   • Dealer registration sets status='pending'; JWT is NOT issued until login.
//   • All JWTs carry { sub: <uuid>, role: 'farmer'|'dealer'|'admin' }.

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase.js';
import { config } from '../../config/env.js';

const BCRYPT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  // ── Farmer demo login ──────────────────────────────────────────────────────
  // Finds or creates a user record by phone_number, then issues a JWT.
  // Per architecture/05_Database.md §2.1: no password column on users table.
  async farmerDemoLogin(
    name: string,
    phoneNumber: string
  ): Promise<{ token: string; user: { id: string; name: string; is_new_user: boolean } }> {
    // 1. Look up existing user by phone_number
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('id, name')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Database error during farmer lookup: ${fetchError.message}`);
    }

    if (existing) {
      const token = this.signToken(existing.id, 'farmer');
      return { token, user: { id: existing.id, name: existing.name, is_new_user: false } };
    }

    // 2. New user — insert record
    const { data: created, error: insertError } = await supabase
      .from('users')
      .insert({ name, phone_number: phoneNumber })
      .select('id, name')
      .single();

    if (insertError || !created) {
      throw new Error(`Failed to create farmer account: ${insertError?.message ?? 'unknown error'}`);
    }

    const token = this.signToken(created.id, 'farmer');
    return { token, user: { id: created.id, name: created.name, is_new_user: true } };
  }

  // ── Dealer login ───────────────────────────────────────────────────────────
  // Verifies email+password. Returns a JWT regardless of approval status —
  // the frontend routes pending dealers to the "Pending Approval" screen;
  // dealer-dashboard endpoints do a second server-side status check.
  async dealerLogin(
    email: string,
    password: string
  ): Promise<{ token: string; dealer: { id: string; status: string } }> {
    const { data: dealer, error } = await supabase
      .from('dealers')
      .select('id, password_hash, status')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error during dealer login: ${error.message}`);
    }

    if (!dealer) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, dealer.password_hash);
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.signToken(dealer.id, 'dealer');
    return { token, dealer: { id: dealer.id, status: dealer.status } };
  }

  // ── Admin login ────────────────────────────────────────────────────────────
  async adminLogin(email: string, password: string): Promise<{ token: string }> {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error during admin login: ${error.message}`);
    }

    if (!admin) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.signToken(admin.id, 'admin');
    return { token };
  }

  // ── Dealer registration ────────────────────────────────────────────────────
  // Creates a new dealer with status='pending'. No JWT is issued here —
  // the dealer must wait for admin approval before they can log in and
  // access the dealer dashboard.
  async dealerRegister(data: {
    shop_name: string;
    owner_name: string;
    email: string;
    password: string;
    phone_number: string;
    location_lat: number;
    location_lng: number;
    address: string;
  }): Promise<{ id: string; status: string }> {
    // Check for duplicate email first to give a clear error
    const { data: existing, error: checkError } = await supabase
      .from('dealers')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Database error during dealer registration: ${checkError.message}`);
    }

    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const password_hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const { data: created, error: insertError } = await supabase
      .from('dealers')
      .insert({
        shop_name: data.shop_name,
        owner_name: data.owner_name,
        email: data.email,
        password_hash,
        phone_number: data.phone_number,
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        address: data.address,
        status: 'pending',
      })
      .select('id, status')
      .single();

    if (insertError || !created) {
      throw new Error(`Failed to register dealer: ${insertError?.message ?? 'unknown error'}`);
    }

    return { id: created.id, status: created.status };
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  private signToken(sub: string, role: string): string {
    return jwt.sign({ sub, role }, config.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
  }
}

export const authService = new AuthService();
