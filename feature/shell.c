// shell.c
// created by poet on 2001.10.23
// added by super
// for command shell, if any problem ,comment it--jason
// poet slightly modified it, to prevent flood¡£
// Super modified again for set vars¡£
// poet modified for stand-alone feature
// poet made support for void or compound statements¡£

#include <shell.h>

STATIC_VAR_TAG int count = 0;
STATIC_VAR_TAG mapping vars = ([ ]);

int delete_var(string prop)
{
        if (! mapp(vars)) return 0;

        map_delete(vars, prop);
        return 1;
}
mixed set_var(string prop, mixed data)
{
        if (! mapp(vars)) vars = ([]);

        return vars[prop] = data;
}

mixed query_var(string prop)
{
        if (! mapp(vars)) return 0;

        return vars[prop];
}

int query_var_count()
{
        return sizeof(vars);
}

mapping query_all_vars()
{
        if (! mapp(vars)) vars = ([]);

        return vars;
}

string process_shell_string(string arg)
{
        mixed result;

        result = evaluate_shell(arg, 0);

        if (stringp(result))
                return result;

        // convert to string
        return sprintf("%O", result);
}

mixed evaluate_shell(string arg, int novalue)
{
        string file, content;
        object me;
        mixed result;
        mixed *var;

        me = this_object();
        // poet added restriction for > (wizard)
        if (novalue && (wiz_level(me) < 4))
                return notify_fail("È¨ÏÞ¾Ü¾ø¡£\n");

        // +2 for the function name and object 'me'
        var = allocate(MAX_VAR_COUNT + 2);

        // use the file to make sure that:
        //          the temp object has the same EUID as the player.
        file = sprintf("%s/%d%d.c", user_cwd(geteuid(me)), time(), count);

        // allow MAX_VAR_COUNT temp file simutaneously.
        if ( count++ >= MAX_VAR_COUNT ) count = 0;

        // filter the following ';'
        if (arg[<1] == ';') arg = arg[0..<2];

        // generate the file header
        content =
                "// Temp file, safe for delete\n"
                "#include <ansi.h>\n"
                "#include <shell.h>\n";

        // generate the function header
        content += novalue
                ? "int main(object me"
                : "mixed main(object me";

        // treat vars as parameters, define the param list.
        //  prepared for pass the vars in parameter later
        if (sizeof(vars) > 0)
                foreach (string key in keys(vars))
                {
                        if (arrayp(vars[key]))
                                content += ", mixed *" + key;
                        else if (objectp(vars[key]))
                                content += ", object " + key;
                        else if (mapp(vars[key]))
                                content += ", mapping " + key;
                        else if (stringp(vars[key]))
                                content += ", string " + key;
                        else if (intp(vars[key]))
                                content += ", int " + key;
                        else if (floatp(vars[key]))
                                content += ", float " + key;
                        else
                                content += ", mixed " + key;
                }

        // generate the function body
        content += novalue
                ? sprintf(")\n{ object here = environment(me);\n"
                "%s; return 1; } \n", arg)
                : sprintf(")\n{ object here = environment(me);\n"
                "return %s; } \n", arg);

        // check if the user has the privilege to write the file
        if (! write_file(file, content, 1))
        {
                if (novalue)
                        return notify_fail("Ð´ÎÄ¼þ³ö´í£¡\n");
                else
                        return "Notify fail: Ð´ÎÄ¼þ³ö´í£¡";
        }

        // fill in environment vars as parameter.
        var[0] = "main";
        var[1] = me;
        for (int i = 2; i <= sizeof(vars) + 1; i++)
                var[i] = values(vars)[i-2];
        // if fail, return the input string
        if (catch(result = call_other(file, var)))
        {
                if (novalue) cat(file);
                rm(file);
                if (novalue)
                        return notify_fail("³ÌÐò±àÒëÊ§°Ü£¡\n");
                else
                        return "Notify fail: ³ÌÐò±àÒëÊ§°Ü£¡";
        }

        // log the usage.
        log_file("static/SHELL", sprintf("%s use shell %s on %s\n",
                                         me->query("id"), arg, ctime(time())));
                                         //me->name_id(1), arg, ctime(time())));

        // remove the temp file.
        destruct(find_object(file));
        rm(file);
        rm(BINARIES_D(file));

        return result;
}

string parse_shell(string arg)
{
        string afters, shells;
        int index1, index2;

        if (! stringp(arg) || (arg == ""))
                return arg;

        index1 = strsrch(arg, SHELL_CHAR);
        while (index1 != -1)
        {
                afters = arg[(index1+1)..<1];
                index2 = strsrch(afters, SHELL_CHAR);
                if (index2 == -1)
                        break;
                afters = afters[0..(index2-1)];

                // calls the shell-process function.
                shells = process_shell_string(afters);
                arg = replace_string(arg,
                                        sprintf(SHELL_STR"%s"SHELL_STR, afters), shells);


                // if failed in the previous process
                index2 = strsrch(arg, SHELL_CHAR);
                if (index1 == index2)
                        break;

                index1 = index2;
        }
        return arg;
}


