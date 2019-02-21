// path.c
// YZC 96/05/29 changed user_cwd();

string user_cwd(string name)
{
        return ("/u/" + name);
}

string user_path(string name)
{
        return (user_cwd(name) + "/");
}

string resolve_path(string curr, string new_path)
{
        int i;
        string *tmp;
        string t1;

	if (! curr)
		curr = "/";

	if (! new_path || new_path == ".")
		return curr;

	if (new_path == "here" && this_player())
		return file_name(environment(this_player())) + ".c";

	if (new_path == "~" || new_path == "~/" )
		new_path = user_path(getuid(this_player()));

	if (sscanf(new_path, "~/%s", t1))
		new_path = user_path(getuid(this_player())) + t1;
	else
	if (sscanf(new_path, "~%s", t1))
		new_path = user_path(t1); 
	else
	if (new_path[0] != '/')
	{
		if( curr[sizeof(curr)-1] != '/' )
			new_path = curr + "/" + new_path;
		else
			new_path = curr + new_path;
	}
	tmp = explode(new_path, "/");

	for (i = 0; i < sizeof(tmp); i++)
	{
		if (tmp[i] == "..")
		{
			if (sizeof(tmp) > 2)
			{
				tmp = tmp[0..(i - 2)] +
                                      tmp[(i + 1)..(sizeof(tmp) - 1)];
				i -= 2;
			} else
			{
				tmp = tmp[2 ..(sizeof(tmp) - 1)];
				i = 0;
			}
		}
	}
	new_path = "/" + implode(tmp, "/");

	if (new_path == "//")
		new_path = "/";

	return new_path;
}
