// object.c

varargs int getoid(object ob)
{
	int id;

	if (!ob) ob = previous_object();
	sscanf(file_name(ob), "%*s#%d", id);
	return id;
}

// Get the owner of a file.  Used by log_error() in master.c.
string file_owner(string file)
{
        string name, rest, dir;

        if (file[0] != '/')
        {
                file = "/" + file;
        }
        if (sscanf(file, "/u/%s/%s/%s", dir, name, rest) == 3)
        {
                return name;
        }
        return 0;
}

// domain_file should return the domain associated with a given file.
string domain_file(string file)
{
	string domain;

	if (sscanf(file, "/d/%s/%*s", domain))
		return domain;

	return ROOT_UID;
}

// creator_file should return the name of the creator of a specific file.
string creator_file(string file)
{
	string *path;

	path = explode(file, "/") - ({ 0 });
	switch (path[0])
        {
		case "adm":
			if (file == SIMUL_EFUN_OB) return "MudOS";
			else return ROOT_UID;
		case "cmds":
                case "shadow":
			return ROOT_UID;
		case "u":
			if (sizeof(path) >= 3) return path[1];
		case "d":
                        return "Domain";
                case "clone":
                        return "Clone";
                case "feature":
                        return "Feature";
                case "kungfu":
                        return "Kungfu";
                case "inherit":
                        return "Inherit";
		default:
			return "Unknow";
	}
}

// author_file should return the name of the author of a specific file.
string author_file(string file)
{
	string name;

	if (sscanf(file, "/u/%*s/%s/%*s", name))
		return name;
	return ROOT_UID;
}

// check the object's euid wheter is root
int is_root(mixed ob)
{
        if (stringp(ob))
                return (SECURITY_D->get_status(ob) == "(admin)");

        if (objectp(ob))
        {
                if (geteuid(ob) == ROOT_UID)
                        // Root object want to execute
                        return 1;

                return (SECURITY_D->get_status(geteuid(ob)) == "(admin)");
        }

        return 1;
}

// Add by Doing
// simul efun:destruct
void destruct(object ob)
{
	if (ob)
        {
		if (previous_object()) ob->remove(geteuid(previous_object()));
		else ob->remove(0);
	}

        efun::destruct(ob);
}
