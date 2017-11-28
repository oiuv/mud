// condition.c
// From ES2
// Modified by Xiang for XKX (12/15/95)
// Update by Doing Lu for HELL

#include <condition.h>
#include <dbase.h>

STATIC_VAR_TAG string last_applyer_name;
STATIC_VAR_TAG string last_applyer_id;

mapping cond_applyer;
mapping conditions;

string query_last_applyer_name()
{
        return last_applyer_name;
}

string query_last_applyer_id()
{
        return last_applyer_id;
}

// Get the object of condiction daemon
private object get_cnd_object(string cnd)
{
        mixed err;
        object cnd_d;

	cnd_d = find_object(CONDITION_D(cnd));
	if (! cnd_d)
	{
		err = catch(cnd_d = load_object(CONDITION_D(cnd)));

		// If we failed to load the external condition daemon, remove
		// it before we stuff log files with error messages.

		if (err || ! cnd_d)
		{
			log_file("condition.err",
				sprintf("Failed to load condition daemon %s, removed from %O\nError: %s\nCurrent conditions:%O\n",
					CONDITION_D(cnd), this_object(), err,
					conditions)
			);
		}
	}

        return cnd_d;
}

// clear a condition of all the condition when cnd == 0
nomask void clear_condition(string cnd)
{
        if (! cnd)
        {
	        conditions = 0;
                cond_applyer = 0;
                last_applyer_name = 0;
                last_applyer_id = 0;
        } else
	if (conditions)
        {
                map_delete(conditions, cnd);
                if (! sizeof(conditions))
                        conditions = 0;

                if (cond_applyer)
                {
                        map_delete(cond_applyer, cnd);
                        if (! sizeof(cond_applyer))
                                cond_applyer = 0;
                }
        }
}

// This function is called by heart_beat to update "continously active"
// conditions. These conditions will be saved as well. Because such type
// of conditions costs heart beat evaluation time, don't make player got
// too much this kind of conditions or you might got lots fo "Too long
// evaluation" error message in the log file.

nomask int update_condition()
{
	string *cnd;
        string *last_applyer;
	int i, flag, update_flag;
	object cnd_d;

	if (! mapp(conditions)) return 0;
        if (! (i = sizeof(conditions)))
        {
                conditions = 0;
                cond_applyer = 0;
                return 0;
        }
	cnd = keys(conditions);
	update_flag = 0;
	while (i--)
	{

		// In order to not casue player lost heart beat occasionally while
		// calling external condition daemons, we take careful calling
		// convention here.

                cnd_d = get_cnd_object(cnd[i]);
		if (! cnd_d)
		{
			if (cnd[i]) clear_condition(cnd[i]);
			continue;
		}

		// We assume since the condition daemon is loaded successfully, the
		// calling on its update_condition() should success as well. Because
		// catch() is somewhat costly, so we don't attempt to catch possible
		// error from the call_other. It is condition daemon's reponsibility
		// that don't cause error in users's heart beat.
		// If condition daemon returns 0 (or update_condition() not defined),
		// we can just assume the condition expired and remove it.

                if (cond_applyer && (last_applyer = cond_applyer[cnd[i]]))
                {
                        last_applyer_id = last_applyer[0];
                        last_applyer_name = last_applyer[1];
                } else
		{
			last_applyer_id = 0;
			last_applyer_name = 0;
		}

		flag = call_other(cnd_d, "update_condition", this_object(), conditions[cnd[i]]);
                if (! conditions)
                {
                        update_flag |= flag;
                        break;
                }
		if (! (flag & CND_CONTINUE))
                {
                        clear_condition(cnd[i]);
                }
		update_flag |= flag;
	}

	return update_flag;
}

// apply_condition()
//
// This function applies the specific condition to the character. Note we 
// don't check if the condition already exist before setting condition info.
// It is condition giver's reponsibility to check if the condition should
// override the old one if same condition already exists.(Use query_condition
// to check)

nomask void apply_condition(string cnd, mixed info)
{
        object applyer;

	if (! stringp(cnd))
	{
		log_file("condition.err", sprintf("Error to apply condition(%O) from object(%O) with info(%O)\n", cnd, previous_object(), info));
		return;
	}

	if (! mapp(conditions))
        {
		conditions = ([ cnd : info ]);
	} else
		conditions[cnd] = info;

        if (objectp(applyer = this_player()) && applyer != this_object() &&
	    userp(applyer))
        {
                if (! mapp(cond_applyer))
                        cond_applyer = ([ cnd : ({ applyer->query("id"), applyer->name(1) }) ]);
                else
                        cond_applyer[cnd] = ({ applyer->query("id"), applyer->name(1) });
        }

	set_heart_beat(1);
}

// query_condition()
//
// This function returns info about the specific condition if any.

nomask mixed query_condition(string cnd)
{
        if (! cnd) return conditions;

	if (! mapp(conditions) || undefinedp(conditions[cnd]))
		return 0;
	return conditions[cnd];
}

// query_last_appler()
//
// This function returns last applyer id & name's mapping

nomask mixed query_last_applyer(string cnd)
{
        if (! cnd)
                return cond_applyer;
        else
        {
                if (! mapp(cond_applyer))
                        return 0;

                return cond_applyer[cnd];
        }
}

// Query a conditon's name
nomask string query_condition_name(string cnd)
{
        object cnd_d;

        if (! (cnd_d = get_cnd_object(cnd)))
	{
		log_file("condition.err", sprintf("%O query condition %s\n",
			this_object(), CONDITION_D(cnd)));
                return 0;
	}

        return cnd_d->cnd_name();
}

// Dispel a condition
nomask int dispel_condition(object ob, string cnd)
{
        object cnd_d;

        if (! (cnd_d = get_cnd_object(cnd)))
	{
		log_file("condition.err", sprintf("%O try to dispel %O %s\n",
			ob, this_object(), CONDITION_D(cnd)));
                return 0;
	}

        return cnd_d->dispel(ob, this_object(), conditions[cnd]);
}

// Call the condition's do_effect funtion
nomask int affect_by(string cnd, mixed para)
{
        object cnd_d;

        if (! (cnd_d = get_cnd_object(cnd)))
	{
		log_file("condition.err", sprintf("%O affect by %s:%O\n",
			this_object(), CONDITION_D(cnd), para));
                return 0;
	}
	
//转世特技诸邪辟易
 if (this_object()->query("special_skill/piyi"))
        {
              return 0;
        }
        if (! para) para = this_object()->query_temp("para");

        return cnd_d->do_effect(this_object(), cnd, para);
}
