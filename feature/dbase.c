// dbase.c

//#include <dbase.h>

inherit F_TREEMAP;

mapping dbase;
STATIC_VAR_TAG mapping tmp_dbase;

//      The default_ob provides the default values of the dbase. It is set to
//      be master copy of an object.
STATIC_VAR_TAG mixed default_ob;

mixed query_default_object() { return default_ob; }
void set_default_object(mixed ob)
{
//      if( geteuid(previous_object()) != ROOT_UID )
//              error("dbase: Only this_object() or object with root euid can set default_ob.\n");
        if( !geteuid() ) seteuid(getuid());
        default_ob = ob;
        //ob->add("no_clean_up", 1);
        ob->set("no_clean_up", 0);
}

mixed set(string prop, mixed data)
{
        if( !mapp(dbase) ) dbase = ([]);

        if( strsrch(prop, '/')!=-1 )
                return _set( dbase, explode(prop, "/"), data );

        return dbase[prop] = data;
}

varargs mixed query(string prop, int raw)
{
        mixed data;

        if( !mapp(dbase) ) return 0;

        if( undefinedp(dbase[prop]) && (strsrch(prop, '/')!=-1) )
                data = _query(dbase, explode(prop, "/"));
        else
                data = dbase[prop];

        if( undefinedp(data) && default_ob )
                data = default_ob->query(prop, 1);

        if( raw ) return data;

        return evaluate( data, this_object() );
}

int delete(string prop)
{
        if( !mapp(dbase) ) return 0;

        if( strsrch(prop, '/')!=-1 )
                return _delete(dbase, explode(prop, "/"));
        else {
                map_delete(dbase, prop);
                return 1;
        }
}

mixed add(string prop, mixed data)
{
        mixed old;

        if( !mapp(dbase) || !(old = query(prop, 1)) )
                return set(prop, data);

        if( functionp(old) )
                error("dbase: add() - called on a function type property.\n");

        return set(prop, old + data);
}

mapping query_entire_dbase()
{
//      if( (previous_object() != this_object())
//      &&      (geteuid(previous_object()) != ROOT_UID) )
//              error("dbase: query_entire_dbase() - must has root euid or be this_object().\n");

        return dbase;
}

mixed set_temp(string prop, mixed data)
{
        if( !mapp(tmp_dbase) ) tmp_dbase = ([]);

        if( strsrch(prop, '/')!=-1 )
                return _set( tmp_dbase, explode(prop, "/"), data );

        return tmp_dbase[prop] = data;
}

varargs mixed query_temp(string prop, int raw)
{
        mixed data;

        if( !mapp(tmp_dbase) ) return 0;

        if( strsrch(prop, '/')!=-1 )
                data = _query(tmp_dbase, explode(prop, "/"));
        else
                data = tmp_dbase[prop];

        if( functionp(data) && !raw )
                return (*data)( this_object() );
        else 
                return data;
}

int delete_temp(string prop)
{
        if( !mapp(tmp_dbase) ) return 0;

        if( strsrch(prop, '/')!=-1 )
                return _delete(tmp_dbase, explode(prop, "/"));
        else {
                map_delete(tmp_dbase, prop);
                return 1;
        }
}

mixed add_temp(string prop, mixed data)
{
        mixed old;

        if( !mapp(tmp_dbase) || !(old = query_temp(prop, 1)) )
                return set_temp(prop, data);

        if( functionp(old) )
                error("dbase: add_temp() - called on a function type property.\n");

        return set_temp(prop, old + data);
}

mapping query_entire_temp_dbase()
{
//      if( (previous_object() != this_object())
//      &&      (geteuid(previous_object()) != ROOT_UID) )
//              error("dbase: query_entire_temp_dbase() - must has root euid or be this_object().\n");

        return tmp_dbase;
}

nomask void set_dbase(mapping data)
{
        if (! is_root(previous_object()))
                return;

        if (! mapp(data))
                return;

        dbase = data;
}


