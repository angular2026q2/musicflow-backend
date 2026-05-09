# MusicFlow (Backend)

Backend service for MusicFlow streaming platform.

## Overview
REST API built with NestJS (TypeScript). Provides authentication, user management, playlists, favorites, and integration with external music APIs.

## Architecture
- Framework: NestJS
- Language: TypeScript
- Database: Supabase (PostgreSQL)
- Auth: JWT (access + refresh tokens)
- API: REST

High-level flow:
Client → API (NestJS) → Database (Supabase) → External APIs (Jamendo)

## Getting Started

### 1. Install dependencies
```bash
npm install
