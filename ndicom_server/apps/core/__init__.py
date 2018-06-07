from django.db.backends.signals import connection_created


def activate_foreign_keys(sender, connection, **kwargs):
    if connection.vendor == 'sqlite':
        cursor = connection.cursor()
        cursor.execute('PRAGMA foreign_keys = ON;')


connection_created.connect(activate_foreign_keys)
