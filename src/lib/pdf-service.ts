import jsPDF from 'jspdf';
import { Plan, Semester, Course } from './types';

export class PDFService {
    static generatePlanPDF(plan: Plan): void {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        let yPosition = margin;

        // Helper function to add text with styling
        const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = '#000000') => {
            doc.setFontSize(fontSize);
            doc.setTextColor(color);
            if (isBold) {
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setFont('helvetica', 'normal');
            }

            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, yPosition);
            yPosition += lines.length * (fontSize * 0.4) + 5;

            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
        };

        // Helper function to add a section header
        const addSectionHeader = (text: string) => {
            yPosition += 10;
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');
            doc.setTextColor('#2c3e50');
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(text, margin + 5, yPosition + 5);
            yPosition += 20;
        };

        // Helper function to add a horizontal line
        const addLine = () => {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
        };

        // Helper function to add a box around content
        const addBox = (height: number) => {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.rect(margin, yPosition - height - 5, contentWidth, height + 10);
        };

        // Title Header
        doc.setFillColor(52, 73, 94); // Dark blue-gray
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('ACADEMIC PLAN OVERVIEW', pageWidth / 2, 25, { align: 'center' });

        yPosition = 50;

        // Plan Information Box
        addBox(60);
        addText('PLAN DETAILS', 16, true, '#2c3e50');
        addText(`Title: ${plan.title}`, 12, true);
        addText(`Major: ${plan.major}`, 12);
        addText(`Career Goal: ${plan.careerGoal || 'Not specified'}`, 12);
        addText(`Status: ${plan.status.toUpperCase()}`, 12);
        addText(`Created: ${plan.createdAt.toLocaleDateString()}`, 10, false, '#7f8c8d');
        addText(`Last Updated: ${plan.updatedAt.toLocaleDateString()}`, 10, false, '#7f8c8d');

        if (plan.description) {
            addText(`Description: ${plan.description}`, 11);
        }

        addLine();

        // Summary Statistics Box
        addBox(80);
        addText('SUMMARY STATISTICS', 16, true, '#2c3e50');

        const totalCredits = plan.semesters.reduce((sum, semester) => sum + semester.credits, 0);
        const totalCourses = plan.semesters.reduce((sum, semester) => sum + semester.courses.length, 0);
        const completedCourses = plan.semesters.reduce((sum, semester) =>
            sum + semester.courses.filter(course => course.completed).length, 0);

        // Create a grid for statistics
        const statsY = yPosition;
        addText(`Total Credits: ${totalCredits}`, 12, true, '#27ae60');
        addText(`Total Courses: ${totalCourses}`, 12, true, '#3498db');
        addText(`Completed: ${completedCourses}`, 12, true, '#27ae60');
        addText(`Remaining: ${totalCourses - completedCourses}`, 12, true, '#e74c3c');
        addText(`Total Semesters: ${plan.semesters.length}`, 12, true, '#9b59b6');

        addLine();

        // Semester Details
        addSectionHeader('SEMESTER BREAKDOWN');

        plan.semesters.forEach((semester, index) => {
            if (yPosition > pageHeight - 100) {
                doc.addPage();
                yPosition = margin;
            }

            // Semester header box
            doc.setFillColor(236, 240, 241);
            doc.rect(margin, yPosition - 5, contentWidth, 20, 'F');
            addText(`${index + 1}. ${semester.name}`, 14, true, '#2c3e50');
            addText(`Credits: ${semester.credits} • Courses: ${semester.courses.length}`, 10, false, '#7f8c8d');

            if (semester.courses.length > 0) {
                semester.courses.forEach((course, courseIndex) => {
                    if (yPosition > pageHeight - 30) {
                        doc.addPage();
                        yPosition = margin;
                    }

                    const status = course.completed ? '✓' : '○';
                    const statusColor = course.completed ? '#27ae60' : '#95a5a6';
                    const courseText = `${status} ${course.code} - ${course.name}`;

                    addText(courseText, 10, false, statusColor);
                    addText(`    ${course.credits} credits • ${course.category.toUpperCase()}`, 9, false, '#7f8c8d');
                });
            } else {
                addText('No courses planned', 10, false, '#95a5a6');
            }

            yPosition += 10;
        });

        // Course List (Alphabetical)
        addSectionHeader('ALL COURSES (ALPHABETICAL)');

        const allCourses: Course[] = [];
        plan.semesters.forEach(semester => {
            semester.courses.forEach(course => {
                allCourses.push(course);
            });
        });

        allCourses.sort((a, b) => a.code.localeCompare(b.code));

        allCourses.forEach((course, index) => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = margin;
            }

            const status = course.completed ? 'COMPLETED' : 'PENDING';
            const statusColor = course.completed ? '#27ae60' : '#e74c3c';
            const courseText = `${course.code} - ${course.name} (${course.credits} credits)`;

            addText(courseText, 10, true);
            addText(`Status: ${status}`, 9, false, statusColor);
        });

        // Footer
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor('#95a5a6');
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated by Plant Academic Planner • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        const fileName = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_plan.pdf`;
        doc.save(fileName);
    }

    static generateSemesterSummaryPDF(plan: Plan): void {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        let yPosition = margin;

        // Helper function to add text with styling
        const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: string = '#000000') => {
            doc.setFontSize(fontSize);
            doc.setTextColor(color);
            if (isBold) {
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setFont('helvetica', 'normal');
            }

            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, yPosition);
            yPosition += lines.length * (fontSize * 0.4) + 5;

            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
        };

        // Helper function to add a horizontal line
        const addLine = () => {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
        };

        // Title Header
        doc.setFillColor(52, 73, 94); // Dark blue-gray
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`${plan.title.toUpperCase()} - SEMESTER SUMMARY`, pageWidth / 2, 25, { align: 'center' });

        yPosition = 50;

        // Plan Info Box
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.rect(margin, yPosition - 5, contentWidth, 40, 'S');

        addText('PLAN OVERVIEW', 14, true, '#2c3e50');
        addText(`Major: ${plan.major}`, 12);
        addText(`Generated: ${new Date().toLocaleDateString()}`, 10, false, '#7f8c8d');

        addLine();

        // Semester Table Header
        doc.setFillColor(236, 240, 241);
        doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');
        doc.setTextColor('#2c3e50');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');

        // Table headers
        const colWidths = [80, 30, 30, 50]; // Semester, Credits, Courses, Status
        doc.text('Semester', margin + 5, yPosition + 5);
        doc.text('Credits', margin + colWidths[0], yPosition + 5);
        doc.text('Courses', margin + colWidths[0] + colWidths[1], yPosition + 5);
        doc.text('Status', margin + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 5);

        yPosition += 20;

        // Semester rows
        plan.semesters.forEach((semester, index) => {
            if (yPosition > pageHeight - 50) {
                doc.addPage();
                yPosition = margin;
            }

            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(248, 249, 250);
                doc.rect(margin, yPosition - 5, contentWidth, 15, 'F');
            }

            doc.setFontSize(10);
            doc.setTextColor('#2c3e50');
            doc.setFont('helvetica', 'normal');

            // Truncate semester name if too long
            const semesterName = semester.name.length > 15 ? semester.name.substring(0, 12) + '...' : semester.name;

            doc.text(semesterName, margin + 5, yPosition + 5);
            doc.text(semester.credits.toString(), margin + colWidths[0], yPosition + 5);
            doc.text(semester.courses.length.toString(), margin + colWidths[0] + colWidths[1], yPosition + 5);

            // Calculate completion status with color coding
            const completedCourses = semester.courses.filter(course => course.completed).length;
            const status = semester.courses.length === 0 ? 'Empty' :
                completedCourses === semester.courses.length ? 'Complete' :
                    completedCourses > 0 ? 'Partial' : 'Planned';

            const statusColor = status === 'Complete' ? '#27ae60' :
                status === 'Partial' ? '#f39c12' :
                    status === 'Empty' ? '#95a5a6' : '#3498db';

            doc.setTextColor(statusColor);
            doc.text(status, margin + colWidths[0] + colWidths[1] + colWidths[2], yPosition + 5);

            yPosition += 15;
        });

        addLine();

        // Summary Statistics Box
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.rect(margin, yPosition - 5, contentWidth, 60, 'S');

        const totalCredits = plan.semesters.reduce((sum, semester) => sum + semester.credits, 0);
        const totalCourses = plan.semesters.reduce((sum, semester) => sum + semester.courses.length, 0);

        addText('SUMMARY STATISTICS', 14, true, '#2c3e50');
        addText(`Total Credits: ${totalCredits}`, 12, true, '#27ae60');
        addText(`Total Courses: ${totalCourses}`, 12, true, '#3498db');
        addText(`Total Semesters: ${plan.semesters.length}`, 12, true, '#9b59b6');

        // Footer
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor('#95a5a6');
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated by Plant Academic Planner • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        const fileName = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.pdf`;
        doc.save(fileName);
    }
}
