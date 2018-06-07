from apps.core.handlers import *
from apps.core.models import User
from apps.core.utils import required_auth, required_admin
from apps.users.serializers import UserSerializer, CreateUserSerializer


class UserAuthHandler(BaseJsonHandler):
    def post(self, *args, **kwargs):
        params = self.request.arguments
        email = params['email']
        password = params['password']
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                # m = sha256()
                # m.update((str(user.id) + '|' + email).encode('utf-8'))
                # self.set_cookie('auth', m.hexdigest())
                self.set_secure_cookie('neurdicom.auth', str(user.id) + '|' + email)
                self.write({
                    'id': user.id,
                    'email': email,
                    'name': user.name,
                    'surname': user.surname,
                    'is_admin': user.is_staff
                })
                return
        except User.DoesNotExist:
            self.write_error(status_code=404)
            self.write({
                'message': 'User with email %s does not exist' % email
            })
            return


@required_auth(methods=['GET'])
class UserListHandler(ListCreateHandler):
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def post(self, *args, **kwargs):
        serializer = CreateUserSerializer(data=self.request.arguments)
        if serializer.is_valid():
            serializer.save()
            self.write(serializer.data)
        else:
            self.write(serializer.error_messages)
            self.send_error(500)


@required_admin(methods=['DELETE'])
class UserDetailHandler(RetrieveUpdateDestroyHandler):
    serializer_class = UserSerializer
    queryset = User.objects.all()


class UserLogoutHandler(BaseJsonHandler):
    def post(self, *args, **kwargs):
        self.clear_all_cookies()
        self.write({
            'message': 'Log out is successful'
        })


@required_auth(methods=['GET'])
class UserCheckHandler(BaseJsonHandler):
    def get(self, *args, **kwargs):
        self.set_status(200)
        self.write('')
