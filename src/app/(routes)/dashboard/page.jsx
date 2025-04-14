'use client'
import React from "react"
import { useEffect, useState } from "react"
import CardInfo from "./_components/CardInfo"
 
import { UserButton, useUser } from "@clerk/nextjs"
import { getTableColumns } from "drizzle-orm"
import { Budgets } from "../../../../utils/schema"


function Dashboard() {
    const {user} = useUser() ;

    const [budgetList, setBudgetList] = useState([]) 
    const [incomeList, setIncomeList] = useState([])
    const [expenseList, setExpensesList] = useState([])


    useEffect(()=> {
        user && getBudgetList()
    }, [user])
    


    const getBudgetList = async () => {
        const result = await db.select({

            ...getTableColumns(Budgets),
            totalSpend: sql`sum(${expenses.amount})`.mapwith(Number),
        }).from(Budgets).leftJoin(expenses, eq(Budgets.id , expenses.budgetId)).where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
        .groupBy(Budgets.id)
        .orderBy(desc(Budgets.id))

        setBudgetList(result)
        getAllExpenses() ;
        getIncomeList() ;


    }
    const getIncomeList = async () => {
        try {
          const result = await db
            .select({
              ...getTableColumns(Incomes),
              totalAmount: sql`SUM(CAST(${Incomes.amount} AS NUMERIC))`.mapWith(
                Number
              ),
            })
            .from(Incomes)
            .groupBy(Incomes.id); // Assuming you want to group by ID or any other relevant column
    
          setIncomeList(result);
        } catch (error) {
          console.error("Error fetching income list:", error);
        }
      };

    const getAllExpenses = async () => {
        const result = await db.select({
            id: expenses.id ,
            name: expenses.name ,
            amount: expneses.amount,
            createdAt: expenses.createdAt
        }).from(Budgets).rightJoin(setExpensesList, eq(Budgets.id, expenses.budgetId))
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress )).orderBy(desc(expenses.id))
        setExpensesList(result)
    }

    return (

        <div className="p-8  ">
        <h2 className="font-bold text-4xl ">
            Hi, {user?.fullName}

        </h2>
        <p className="text-gray-500">
        Here's what happenning with your money, Lets Manage your expense
      </p>

      <CardInfo budgetList={budgetList} incomeList={incomeList} />
      <div className="grid grid-cols-1 lg:grid-cols-3 mt-6 gap-5">
        <div className="lg:col-span-2">
          <BarChartDashboard budgetList={budgetList} />

          <ExpenseListTable
            expensesList={expensesList}
            refreshData={() => getBudgetList()}
          />
        </div>
        <div className="grid gap-5">
          <h2 className="font-bold text-lg">Latest Budgets</h2>
          {budgetList?.length > 0
            ? budgetList.map((budget, index) => (
                <BudgetItem budget={budget} key={index} />
              ))
            : [1, 2, 3, 4].map((item, index) => (
                <div
                  className="h-[180xp] w-full
                 bg-slate-200 rounded-lg animate-pulse"
                ></div>
              ))}
        </div>
      </div>

     </div>

    )
    
}


export default  Dashboard  ;