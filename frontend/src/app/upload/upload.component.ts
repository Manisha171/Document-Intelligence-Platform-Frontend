import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  extractedText: string = '';
  namedEntities: { word: string; entity_group: string; score: number }[] = [];
  isUploading: boolean = false;
  error: string = '';

  // 🔽 Chat properties
  questionInput: string = '';
  chatHistory: { question: string; answer: string }[] = [];

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.extractedText = '';
    this.namedEntities = [];
    this.error = '';
  }

  upload() {
    if (!this.selectedFile) {
      this.error = 'Please select a file first.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.isUploading = true;
    this.extractedText = '';
    this.namedEntities = [];
    this.chatHistory = [];
    this.error = '';

    this.http.post<{ text: string; entities: any[] }>('http://localhost:3000/upload', formData)
      .subscribe({
        next: (response) => {
          this.extractedText = response.text;
          this.namedEntities = response.entities || [];
          this.isUploading = false;
        },
        error: (err) => {
          this.error = 'Upload failed. Please try again.';
          console.error(err);
          this.isUploading = false;
        }
      });
  }

  askQuestion() {
    if (!this.questionInput) {
      this.error = 'Please enter a question.';
      return;
    }

    const question = this.questionInput;

    this.http.post<{ answer: string }>('http://localhost:3000/ask', { question }).subscribe({
      next: (response) => {
        this.chatHistory.push({ question, answer: response.answer });
        this.questionInput = '';
        this.error = '';
      },
      error: (err) => {
        this.error = 'Failed to get an answer. Please try again.';
        console.error(err);
      }
    });
  }
}
