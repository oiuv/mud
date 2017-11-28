// autoload.c
// From ES2
// Modified by Xiang for XKX (12/15/95)
// Updated by Doing for load unique object(inherit from F_NOCLONE)

string *autoload;

void clean_up_autoload() { autoload = 0; }

void save_autoload()
{
	object *inv;
        object *obs;
	int i, j;
	mixed param;

	inv = all_inventory();
        if (arrayp(obs = this_object()->query_temp("hire")))
                inv += obs - ({ 0 });
	autoload = allocate(sizeof(inv));
	for (i = 0, j = 0; i < sizeof(inv); i++)
        {
		if (! (param = inv[i]->query_autoload())) continue;
		autoload[j] = base_name(inv[i]);
		if (stringp(param)) autoload[j] += ":" + param;
		j++;
	}
	autoload = autoload[0..j - 1];
}

void restore_autoload()
{
	int i;
	object ob;
	string file, param, err;
        int has_dropped;

	if (! pointerp(autoload)) return;

        has_dropped = 0;
	for (i = 0; i < sizeof(autoload); i++)
        {
	        if (! autoload[i] || autoload[i] == "")
                        continue;

		if (sscanf(autoload[i], "%s:%s", file, param) != 2)
                {
			file = autoload[i];
			param = 0;
		}
		if (file_size(file + ".c") > 0)
		{
                	err = catch(call_other(file, "???"));
                	ob = find_object(file);
		} else
		{
			err = 0;
			ob = 0;
		}
                if (ob && ! ob->is_no_clone()) ob = new(file);
		if (err || ! ob || ob->is_no_clone() && environment(ob))
                {
                        string temp;
                        if (file && sscanf(file, "/data/%*s/%s", temp))
                        {
                                if (has_dropped) continue;
                                has_dropped++;
                                write("你发现有些东西已经没有用了，随手就扔掉了。\n");
                        } else
			        write("你觉得似乎失落了什么重要的东西，最好通知一下巫师。\n");
			log_file("autoload", sprintf("Fail to autoload %s of %s, error %s(%s)\n",
				 file, this_object()->query("name"),
			         this_object()->query("id"),
                                 ob ? "The no clone object has existed" : err));
			continue;
		}
                if (ob->is_no_clone() && ob->is_not_belong_me(this_object()))
                {
                        if (! environment(ob)) destruct(ob);
                        continue;
                }

		export_uid(ob);
                if (! ob->is_character())
		        ob->move(this_object(), 1);

		ob->autoload(param, this_object());
	}
	clean_up_autoload();		// To save memory.
}

string *query_autoload_info()
{
        return autoload;
}

void set_autoload_info(string *data)
{
        autoload = data;
}
