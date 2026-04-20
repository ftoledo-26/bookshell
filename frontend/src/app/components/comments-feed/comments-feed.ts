import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Comentario } from '../../models/Comentario';

export type HomeComment = Comentario & {
  username: string;
  movieTitle: string;
  createdAt: string;
  avatarUrl?: string;
};

@Component({
  selector: 'app-comments-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comments-feed.html',
  styleUrl: './comments-feed.css'
})
export class CommentsFeedComponent {
  @Input({ required: true }) comments: HomeComment[] = [];

  trackByCommentId(index: number, comment: HomeComment): number {
    return comment.id;
  }
}