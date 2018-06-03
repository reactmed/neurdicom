from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer

from apps.core.models import User


class CreateUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'surname', 'email', 'password']

    def is_valid(self, raise_exception=False):
        email = self.data['email']
        if User.objects.filter(email=email).exists():
            self.error_messages.update({
                'email': 'User with email "%s" already exists' % email
            })
            return False
        return True


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'surname', 'email']
