import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('pdf') as File;

        if (!file) {
            return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
        }

        // Convert file to base64 for Gemini
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Data = buffer.toString('base64');

        // Use Gemini AI to extract course information directly from PDF
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
    Please analyze this Northeastern University transcript/course list PDF and extract all completed courses.
    
    For each course, extract:
    - Course code (e.g., CS 2500, MATH 1341)
    - Course name/title
    - Credits
    - Grade (if available)
    - Semester/Term (if available)
    
    Return the data in JSON format as an array of objects with these fields:
    {
      "courseCode": "string",
      "courseName": "string", 
      "credits": number,
      "grade": "string" (optional),
      "semester": "string" (optional)
    }
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: 'application/pdf',
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        let courses;
        try {
            // Extract JSON from the response (in case there's extra text)
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                courses = JSON.parse(jsonMatch[0]);
            } else {
                courses = JSON.parse(text);
            }
        } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError);
            return NextResponse.json({
                error: 'Failed to parse course data from PDF'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            courses: courses,
            totalCourses: courses.length
        });

    } catch (error) {
        console.error('Error processing PDF:', error);
        return NextResponse.json({
            error: 'Failed to process PDF'
        }, { status: 500 });
    }
}
