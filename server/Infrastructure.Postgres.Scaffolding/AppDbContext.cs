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
    public virtual DbSet<SchoolContact> Contacts { get; set; }
    public virtual DbSet<GeneratedReport> GeneratedReports { get; set; } = null!;
    public virtual DbSet<SchoolEvent> Events { get; set; }
    public virtual DbSet<Question> Questions { get; set; }
    public virtual DbSet<QuestionOption> QuestionOptions { get; set; }
    public virtual DbSet<Survey> Surveys { get; set; }
    public virtual DbSet<SurveyResponse> SurveyResponses { get; set; }
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<UserGuest> UserGuests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("uuid-ossp");

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

        modelBuilder.Entity<SchoolContact>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("contacts_pkey");

            entity.ToTable("contacts", "crazyrobot");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Department).HasColumnName("department");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Phone).HasColumnName("phone");
            entity.Property(e => e.Role).HasColumnName("role");
        });

        modelBuilder.Entity<SchoolEvent>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("events_pkey");

            entity.ToTable("events", "crazyrobot");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Category).HasColumnName("category");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Location).HasColumnName("location");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Time).HasColumnName("time");
            entity.Property(e => e.Title).HasColumnName("title");
        });

        modelBuilder.Entity<GeneratedReport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("generated_report_pkey");

            entity.ToTable("generated_report", "crazyrobot");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GeneratedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("generated_at");
            entity.Property(e => e.ReportText).HasColumnName("report_text");
            entity.Property(e => e.SurveyId).HasColumnName("survey_id");
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
        
        modelBuilder.Entity<GeneratedReport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("generated_report_pkey");

            
            entity.ToTable("generated_report", "crazyrobot");

            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.SurveyId).HasColumnName("survey_id");
            entity.Property(x => x.GeneratedAt).HasColumnName("generated_at");
            entity.Property(x => x.ReportText).HasColumnName("report_text");
        });

        modelBuilder.Entity<SurveyResponse>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("survey_response_pkey");

            entity.ToTable("survey_response", "crazyrobot");

            entity.HasIndex(e => e.SurveyId, "IX_survey_response_survey_id");

            entity.HasIndex(e => e.UserId, "ix_survey_response_user_guest_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SubmittedAt).HasColumnName("submitted_at");
            entity.Property(e => e.SurveyId).HasColumnName("survey_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Survey).WithMany(p => p.SurveyResponses)
                .HasForeignKey(d => d.SurveyId)
                .HasConstraintName("fk_response_survey");

            entity.HasOne(d => d.User).WithMany(p => p.SurveyResponses)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_response_user_guest");
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

        modelBuilder.Entity<UserGuest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_guest_pkey");

            entity.ToTable("user_guest", "crazyrobot");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedDate).HasColumnName("created_date");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.Role).HasColumnName("role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
