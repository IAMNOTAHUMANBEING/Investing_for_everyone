from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
# from django.template.defaultfilters import slugify

from markdownx.utils import markdown
from markdownx.models import MarkdownxField

class Wiki(models.Model):
    name = models.CharField(max_length=30, unique=True)
    code = models.CharField(max_length=10, blank=True, default="")
    content = MarkdownxField(blank=True, default="")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('single_page:wiki', kwargs={"pk": self.pk})

    def get_content_markdown(self):
        return markdown(self.content)


# class Stock(models.Model):
#     name = models.CharField(max_length=30, unique=True)
#     #slug = models.SlugField(null=True, unique=True, allow_unicode=True)
#     code = models.CharField(max_length=10, unique=True)
#     content = MarkdownxField(blank=True, default="")
#
#     def __str__(self):
#         return self.name
#
#     def get_absolute_url(self):
#         return reverse('single_page:stock', kwargs={"pk": self.pk})
#
#     def get_content_markdown(self):
#         return markdown(self.content)
#
#     # def save(self, *args, **kwargs):  # new
#     #     if not self.slug:
#     #         self.slug = slugify(self.name)
#     #     return super().save(*args, **kwargs)
#
# class Person(models.Model):
#     name = models.CharField(max_length=30, unique=True)
#     slug = models.SlugField(max_length=30, unique=True, allow_unicode=True)
#     content = MarkdownxField(blank=True, default="")
#
#     def __str__(self):
#         return self.name
#
#     def get_absolute_url(self):
#         return reverse('single_page:person', kwargs={"slug": self.slug})
#
#     def get_content_markdown(self):
#         return markdown(self.content)
#
# class Word(models.Model):
#     name = models.CharField(max_length=30, unique=True)
#     slug = models.SlugField(max_length=30, unique=True, allow_unicode=True)
#     content = MarkdownxField(blank=True, default="")
#
#     def __str__(self):
#         return self.name
#
#     def get_absolute_url(self):
#         return reverse('single_page:word', kwargs={"slug": self.slug})
#
#     def get_content_markdown(self):
#         return markdown(self.content)

class Block(models.Model):
    title = models.CharField(max_length=50)
    date = models.DateField()
    content = MarkdownxField(blank=True, default="")
    speaker = models.ForeignKey(Wiki, on_delete=models.SET_NULL, null=True, blank=True, default="", related_name='block_speaker')

    EVENT = 'EV'
    OPINION = 'OP'
    REPORT = 'RE'
    category_choice = (
        (EVENT, 'Event'),
        (OPINION, 'Opinion'),
        (REPORT, 'Report')
    )
    category = models.CharField(max_length=2, choices=category_choice, default=EVENT)

    tag = models.ManyToManyField(Wiki, blank=True, related_name='block_tag')

    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now=True)
    modified_at = models.DateTimeField(auto_now_add=True)

    def get_absolute_url(self):
        return

    def __str__(self):
        return self.title

    def get_content_markdown(self):
        return markdown(self.content)

    class Meta:
        ordering = ('-date',)

# class Event(models.Model):
#     title = models.CharField(max_length=50)
#     date = models.DateField()
#     content = MarkdownxField(blank=True, default="")
#
#     stock_tag = models.ManyToManyField(Stock, blank=True)
#     word_tag = models.ManyToManyField(Word, blank=True)
#     person_tag = models.ManyToManyField(Person, blank=True)
#
#     author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
#     created_at = models.DateTimeField(auto_now=True)
#     modified_at = models.DateTimeField(auto_now_add=True)
#
#     def get_absolute_url(self):
#         return
#
#     def __str__(self):
#         return self.title
#
#     def checktype(self):
#         return "E"
#
#     def get_content_markdown(self):
#         return markdown(self.content)
#
#     # def get_previous(self):
#     #     return self.get_previous_by_date()
#     #
#     # def get_next(self):
#     #     return self.get_next_by_date()
#
#     class Meta:
#         ordering = ('-date',)
#
# class Opinion(models.Model):
#     title = models.CharField(max_length=50)
#     date = models.DateField()
#     content = MarkdownxField(blank=True, default="")
#
#     person_tag = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True)
#     stock_tag = models.ManyToManyField(Stock, blank=True)
#     word_tag = models.ManyToManyField(Word, blank=True)
#
#     author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
#     created_at = models.DateTimeField(auto_now=True)
#     modified_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return self.title
#
#     def checktype(self):
#         return "O"
#
#     def get_content_markdown(self):
#         return markdown(self.content)
#
#     class Meta:
#         ordering = ('-date',)
#
#
# class Report(models.Model):
#     title = models.CharField(max_length=30)
#     author = models.ManyToManyField(Person)
#     institution = models.CharField(max_length=10)
#     target_price = models.IntegerField()
#     consensus = models.CharField(max_length=10)
#     date = models.DateTimeField()
#
#     def __str__(self):
#         return self.title
#
#     def checktype(self):
#         return "R"



