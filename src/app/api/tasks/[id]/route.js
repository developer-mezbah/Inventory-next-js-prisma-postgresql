
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET single task
export async function GET(request, { params }) {
  try {
    const {id} = await params;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update task
export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const {id} = await params;
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: body
    })
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE task
export async function DELETE(request, { params }) {
  try {
    const {id} = await params;
    await prisma.task.delete({
      where: { id: parseInt(id) }
    })
    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}