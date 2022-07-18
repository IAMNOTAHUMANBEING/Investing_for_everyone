from django.db import models

from markdownx.utils import markdown
from markdownx.models import MarkdownxField

class Home(models.Model):
    name = models.CharField(null=True, max_length=30, unique=True)
    textfield = MarkdownxField(blank=True, default="")

    def get_textfield_markdown(self):
        return markdown(self.textfield)


