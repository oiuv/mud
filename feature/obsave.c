// obsave.c

int is_ob_saved() { return 1; }

int save()
{
        DBASE_D->set_data(this_object()->save_dbase_data());
	return 1;
}

int restore()
{
        this_object()->receive_dbase_data(DBASE_D->query_data());

	return 1;
}
