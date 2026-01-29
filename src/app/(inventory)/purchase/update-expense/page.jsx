import ExpencePage from '@/components/Expence/ExpenceManagement/ExpencePage'
import React from 'react'

const getData = async (expenseId, categoryId) => {
  // Simulate fetching data
  const expense = await prisma.Expense.findUnique({
    where: { id: expenseId },
    include: {
      items: true,
      invoiceData: true
    },
  });
  const category = await prisma.ExpenseCategory.findUnique({
    where: { id: categoryId },
  });
  return {expense: expense, category: category};
}

const page = async ({ searchParams }) => {
  let searchParms = await searchParams;

  const data = await getData(searchParms?.id, searchParms?.categoryId)
console.log(data);


  if (!data) {
    return <p>Someting went wrong!</p>;
  }
  return (
    <div>
        <ExpencePage mode="update" initData={getData?.data} />
    </div>
  )
}

export default page