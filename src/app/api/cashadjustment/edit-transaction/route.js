import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";



/**
 * Calculates the new total amount after editing an existing transaction, 
 * accounting for potential changes in both amount and transaction type.
 * * @param {object} transaction - The original transaction state (must include 'amount' and 'type').
 * @param {object} body - The new data state (must include 'amount' and 'adjustmentType').
 * @param {number} totalAmountField - The current running total amount (e.g., 900).
 * @returns {number} The new calculated total amount (e.g., 100).
 */
function updateTransactionAndTotal(transaction, body, totalAmountField) {
    // 1. Retrieve data
    const oldAdjustmentAmount = transaction?.amount || 0;
    const oldAdjustmentType = transaction?.type;

    const newAdjustmentAmount = body?.amount || 0;
    const newAdjustmentType = body?.adjustmentType;

    // Safety check
    if (typeof totalAmountField !== 'number') {
        console.error("Total amount field is missing or not a number.");
        return totalAmountField;
    }

    // --- Core Calculation: Net Change (Delta) ---

    // A. Calculate the effect of the OLD transaction on the total (to REVERSE it).
    // The reversal is the amount to ADD BACK to the total to undo the old effect.
    let reversalEffect = 0;
    if (oldAdjustmentType === "Add Cash") {
        reversalEffect = -oldAdjustmentAmount; // To undo an ADD, we SUBTRACT.
    } else if (oldAdjustmentType === "Reduce Cash") {
        reversalEffect = +oldAdjustmentAmount; // To undo a REDUCE, we ADD.
    }

    // B. Calculate the effect of the NEW transaction on the total (to APPLY it).
    let applicationEffect = 0;
    if (newAdjustmentType === "Add Cash") {
        applicationEffect = +newAdjustmentAmount; // To apply an ADD, we ADD.
    } else if (newAdjustmentType === "Reduce Cash") {
        applicationEffect = -newAdjustmentAmount; // To apply a REDUCE, we SUBTRACT.
    }

    // C. The NET CHANGE is the sum of the reversal and the new application.
    const netChange = reversalEffect + applicationEffect;

    // D. Calculate the New Total
    const newTotalAmount = totalAmountField + netChange;

    // --- Apply Updates (Simulating Database/Object Update) ---

    // Update the specific transaction entry
    transaction.amount = newAdjustmentAmount;
    transaction.type = newAdjustmentType;

    console.log("--- Update Summary ---");
    console.log(`Current Running Total (Before Edit): ${totalAmountField}`);
    console.log(`Original Transaction: ${oldAdjustmentType} $${oldAdjustmentAmount}`);
    console.log(`New Edited Transaction: ${newAdjustmentType} $${newAdjustmentAmount}`);
    console.log(`1. Reversal Effect (Undo Old): ${reversalEffect}`);
    console.log(`2. Application Effect (Apply New): ${applicationEffect}`);
    console.log(`Net Change in Total: ${netChange}`);
    console.log(`New Final Total Amount: ${newTotalAmount}`);

    return newTotalAmount;
}



// Output Breakdown:
// 1. Reversal Effect (Undo Add 400): -400
// 2. Application Effect (Apply Reduce 400): -400
// Net Change in Total: -800
// New Final Total Amount: 900 + (-800) = 100

export async function PUT(req) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const userId = url.searchParams.get('userId');
        const body = await req.json();


        const transaction = await prisma.Transaction.findUnique({
            where: { id, companyId: await getCompanyId() }
        })
        if (transaction) {
            await prisma.CashAdjustment.update({
                where: {
                    userId,
                    companyId: await getCompanyId()
                },
                data: {
                    cashInHand: updateTransactionAndTotal(transaction, body, body?.cashInHand)
                }
            })
            await prisma.Transaction.update({
                where: { id, companyId: await getCompanyId() },
                data: {
                    amount: body?.amount,
                    type: body?.adjustmentType,
                    date: new Date(body?.adjustmentDate.replace(/[\[\]]/g, '')),
                    description: body?.description,
                }
            });
        }
        return NextResponse.json({ message: "Transaction Edited successfully", status: true });
    } catch (error) {
        console.log(error);

        return NextResponse.json({ error: error || "Failed to Edit Transaction" }, { status: 500 });
    }
}
