// save.c

int save()
{
	string file;

	if (stringp(file = this_object()->query_save_file()))
	{
		assure_file(file+ __SAVE_EXTENSION__);
		return save_object(file);
	}

	return 0;
}

int restore()
{
	string file;

	if (stringp(file = this_object()->query_save_file()))
		return restore_object(file);
	return 0;
}

