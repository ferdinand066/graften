import { db } from "@/server/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { registerSchema, type RegisterSchema } from "schema/auth/register.schema";
import { USER_ROLE } from "utils/constants";
import { z } from "zod";

import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RegisterSchema;
    const { name, email, password } = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: USER_ROLE.USER,
      },
    });

    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path,
        message: err.message,
        code: err.code,
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: formattedErrors,
          message: "Please check your input and try again."
        },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
