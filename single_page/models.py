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
    tag = models.ManyToManyField('self', blank=True, default="", symmetrical=False)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('single_page:wiki', kwargs={"pk": self.pk})

    def get_content_markdown(self):
        return markdown(self.content)

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




