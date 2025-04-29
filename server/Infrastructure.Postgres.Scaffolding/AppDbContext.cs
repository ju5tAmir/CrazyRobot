using System;
using System.Collections.Generic;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Scaffolding;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Answer> Answers { get; set; }

    public virtual DbSet<Question> Questions { get; set; }

    public virtual DbSet<QuestionOption> QuestionOptions { get; set; }

    public virtual DbSet<Survey> Surveys { get; set; }

    public virtual DbSet<SurveyResponse> SurveyResponses { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Answer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("answer_pkey");

            entity.ToTable("answer", "crazyrobot");

            entity.HasIndex(e => e.QuestionId, "IX_answer_question_id");

            entity.HasIndex(e => e.SelectedOptionId, "IX_answer_selected_option_id");

            entity.HasIndex(e => e.SurveyResponseId, "IX_answer_survey_response_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AnswerText).HasColumnName("answer_text");
            entity.Property(e => e.QuestionId).HasColumnName("question_id");
            entity.Property(e => e.SelectedOptionId).HasColumnName("selected_option_id");
            entity.Property(e => e.SurveyResponseId).HasColumnName("survey_response_id");

            entity.HasOne(d => d.Question).WithMany(p => p.Answers)
                .HasForeignKey(d => d.QuestionId)
                .HasConstraintName("fk_answer_question");

            entity.HasOne(d => d.SelectedOption).WithMany(p => p.Answers)
                .HasForeignKey(d => d.SelectedOptionId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_answer_option");

            entity.HasOne(d => d.SurveyResponse).WithMany(p => p.Answers)
                .HasForeignKey(d => d.SurveyResponseId)
                .HasConstraintName("fk_answer_response");
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("question_pkey");

            entity.ToTable("question", "crazyrobot");

            entity.HasIndex(e => e.SurveyId, "IX_question_survey_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.OrderNumber).HasColumnName("order_number");
            entity.Property(e => e.QuestionText).HasColumnName("question_text");
            entity.Property(e => e.QuestionType).HasColumnName("question_type");
            entity.Property(e => e.SurveyId).HasColumnName("survey_id");

            entity.HasOne(d => d.Survey).WithMany(p => p.Questions)
                .HasForeignKey(d => d.SurveyId)
                .HasConstraintName("fk_question_survey");
        });

        modelBuilder.Entity<QuestionOption>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("question_option_pkey");

            entity.ToTable("question_option", "crazyrobot");

            entity.HasIndex(e => e.QuestionId, "IX_question_option_question_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.OptionText).HasColumnName("option_text");
            entity.Property(e => e.OrderNumber).HasColumnName("order_number");
            entity.Property(e => e.QuestionId).HasColumnName("question_id");

            entity.HasOne(d => d.Question).WithMany(p => p.QuestionOptions)
                .HasForeignKey(d => d.QuestionId)
                .HasConstraintName("fk_option_question");
        });

        modelBuilder.Entity<Survey>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("survey_pkey");

            entity.ToTable("survey", "crazyrobot");

            entity.HasIndex(e => e.CreatedByUserId, "IX_survey_created_by_user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.SurveyType).HasColumnName("survey_type");
            entity.Property(e => e.Title).HasColumnName("title");

            entity.HasOne(d => d.CreatedByUser).WithMany(p => p.Surveys)
                .HasForeignKey(d => d.CreatedByUserId)
                .HasConstraintName("fk_survey_user");
        });

        modelBuilder.Entity<SurveyResponse>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("survey_response_pkey");

            entity.ToTable("survey_response", "crazyrobot");

            entity.HasIndex(e => e.SurveyId, "IX_survey_response_survey_id");

            entity.HasIndex(e => e.UserId, "IX_survey_response_user_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SubmittedAt).HasColumnName("submitted_at");
            entity.Property(e => e.SurveyId).HasColumnName("survey_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Survey).WithMany(p => p.SurveyResponses)
                .HasForeignKey(d => d.SurveyId)
                .HasConstraintName("fk_response_survey");

            entity.HasOne(d => d.User).WithMany(p => p.SurveyResponses)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_response_user");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_pkey");

            entity.ToTable("user", "crazyrobot");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedDate).HasColumnName("created_date");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.Hash).HasColumnName("hash");
            entity.Property(e => e.Role).HasColumnName("role");
            entity.Property(e => e.Salt).HasColumnName("salt");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
