#include <ansi.h>

string sort_msg(string input)
{
#ifdef DOING_IMPROVED
        return efun::sort_string(input, 60, 0);
#else
        int i;
        int sl;
        int len;
        int esc;
        string result;
        result = "";

        len = 0;
        esc = 0;
        sl = strlen(input);
        for (i = 0; i < sl; i++)
        {
                if (len >= 54 && input[i] != '\n')
                {
                        switch (input[i..i+1])
                        {
                        case "：":
                        case "”":
                        case "。":
                        case "，":
                        case "、":
                        case "；":
                        case "）":
                        case " )":
                        case "！":
                        case "？":
                                break;
                        default:
                                len = 0;
                                result += "\n";
                                break;
                        }
                }

                if (input[i] == 27)
                        esc = 1;

                if (! esc)
                {
                        if (input[i] > 160)
                        {
                                result += input[i..i+1];
                                i ++;
                                len += 2;
                                continue;
                        }
                        if (input[i] == '\n')
                        {
                                result += "\n";
                                len = 0;
                                continue;
                        }
                }

                result += input[i..i];
                if (! esc) len++;

                if (esc && input[i] == 'm')
                        esc = 0;
        }

        if (i < sl)
                result += input[i..sl-1];

        return result;
#endif
}

varargs void message_vision(string msg, object me, object you)
{
	string my_gender, your_gender, my_name, your_name;
	string str1, str2, str3;

    if ( !me ) return;

	my_name = me->name();
	my_gender = me->query("gender");

	str1 = replace_string(msg,  "$P", gender_self(my_gender));
	str1 = replace_string(str1, "$N", gender_self(my_gender));
	str3 = replace_string(msg,  "$P", my_name);
	str3 = replace_string(str3, "$N", my_name);

	if (you)
        {
	        your_name = you->name();
	        your_gender = you->query("gender");
	        str1 = replace_string(str1, "$p", gender_pronoun(your_gender));
	        str1 = replace_string(str1, "$n", your_name);

		str3 = replace_string(str3, "$p", your_name);
		str3 = replace_string(str3, "$n", your_name);

		str2 = replace_string(msg,  "$P", gender_pronoun(my_gender));
		str2 = replace_string(str2, "$p", gender_self(your_gender));
		str2 = replace_string(str2, "$N", my_name);
		str2 = replace_string(str2, "$n", gender_self(your_gender));
		message("vision", str2, you);
        }

        message("vision", str1, me);

        if ( environment(me) )
        {
            message("vision", str3, all_inventory(environment(me)), ({ me, you }));
        }
}

varargs void message_sort(string msg, object me, object you)
{
	string my_gender, your_gender, my_name, your_name;
	string str1, str2, str3;

    if ( !me ) return;

	my_name= me->name();
	my_gender = me->query("gender");
	str1 = replace_string(msg,  "$P", gender_self(my_gender));
	str1 = replace_string(str1, "$N", gender_self(my_gender));
	str3 = replace_string(msg,  "$P", my_name);
	str3 = replace_string(str3, "$N", my_name);

	if (you)
        {
		your_name= you->name();
		your_gender= you->query("gender");

		str2 = replace_string(msg,  "$P", gender_pronoun(my_gender));
		str2 = replace_string(str2, "$p", gender_self(your_gender));
		str2 = replace_string(str2, "$N", my_name);
		str2 = replace_string(str2, "$n", gender_self(your_gender));
		message("vision", sort_msg(str2), you);

		str1 = replace_string(str1, "$p", gender_pronoun(your_gender));
		str1 = replace_string(str1, "$n", your_name);
		str3 = replace_string(str3, "$p", your_name);
		str3 = replace_string(str3, "$n", your_name);
	}

	message("vision", sort_msg(str1), me);
	message("vision", sort_msg(str3),  environment(me), ({ me, you}) );
}

/* Definition of the level of showing combat message */
#define	SHOW_ALL		0
#define	SHOW_DAMAGE		1
#define	SHOW_BRIEF_DAMAGE	2
#define	SHOW_BRIEF_SELF_DAMAGE	3
#define	SHOW_NONE		4

varargs void message_combatd(string msg, object me, object you, string damage_info)
{
	string my_gender, your_gender, my_name, your_name;
	string str1, str2, str3f, str3d;
	mixed my_flag;
	mixed your_flag;
	int damage_flag;
	int brief;
        int others;
        object ob;
        object *obs;

    if ( !me ) return;

	brief = 1;
	if (! damage_info)
	{
		// No damage_info defined, so I must show full message.
		damage_info = "";
		brief = 0;
                msg = "\n" + msg;
	}

	damage_flag = (strlen(damage_info) > 0);

	my_name= me->name();
	my_gender = me->query("gender");

	if (you)
        {
		your_name = you->name();
		your_gender = you->query("gender");
        }

        if (userp(me))
        {
        	if (! brief) my_flag = SHOW_ALL;
                else
        	{
        		my_flag = me->query("env/combatd");
        		if (stringp(my_flag) && my_flag == "YES") my_flag = SHOW_BRIEF_DAMAGE;
        		if (! intp(my_flag)) my_flag = SHOW_ALL;
        	}

        	if (my_flag >= SHOW_BRIEF_SELF_DAMAGE || my_flag && ! damage_flag)
        	{
        		if (! stringp(str1 = me->query("env/ignore_combat")))
        			str1 = "";
        		else
        			str1 += "\n";
        	} else
        	if (my_flag == SHOW_BRIEF_DAMAGE)
        		str1 = damage_info;
        	else
        		str1 = msg + damage_info;

	        str1 = replace_string(str1, "$P", gender_self(my_gender));
	        str1 = replace_string(str1, "$N", gender_self(my_gender));
                if (you)
                {
        	        str1 = replace_string(str1, "$p", gender_pronoun(your_gender));
        	        str1 = replace_string(str1, "$n", your_name);
                }

        	if (strlen(str1) > 0)
                        message("tell_object", str1, me);
        }

	if (you && userp(you))
        {
		if (! brief) your_flag = SHOW_ALL;
		else
                {
		        your_flag = you->query("env/combatd");
		        if (stringp(your_flag) && your_flag == "YES") your_flag = SHOW_BRIEF_DAMAGE;
		        if (! intp(your_flag)) your_flag = SHOW_ALL;
                }

		if (your_flag == SHOW_ALL || damage_flag && your_flag < SHOW_NONE)
                {
			if (your_flag <= SHOW_DAMAGE)
			        str2 = msg + damage_info;
			else
				str2 = damage_info;

                        str2 = replace_string(str2, "$P", gender_pronoun(my_gender));
		        str2 = replace_string(str2, "$p", gender_self(your_gender));
		        str2 = replace_string(str2, "$N", my_name);
		        str2 = replace_string(str2, "$n", gender_self(your_gender));
                        if (strlen(str2) > 0)
		                message("tell_object", str2, you);
                }
	}

        obs = filter_array(all_inventory(environment(me)),
                           (: userp($1) || $1->want_receive_msg() :)) -
              ({ me, you });
        others = sizeof(obs);
        if (others)
        {
                str3f = msg;
                str3d = damage_info;
        	str3f = replace_string(str3f, "$P", my_name);
        	str3f = replace_string(str3f, "$N", my_name);
        	str3d = replace_string(str3d, "$P", my_name);
        	str3d = replace_string(str3d, "$N", my_name);
                if (you)
                {
        		str3f = replace_string(str3f, "$p", your_name);
        		str3f = replace_string(str3f, "$n", your_name);
        		str3d = replace_string(str3d, "$p", your_name);
        		str3d = replace_string(str3d, "$n", your_name);
                }

                if (brief)
                        str3f += str3d;
                else
                        // no damage info, so I must show all the message info
                        str3d = str3f;

                if (strlen(str3f) < 1)
                        return;

                foreach (ob in obs)
                {
                        switch (ob->query("env/combatd"))
                        {
                        case SHOW_NONE:
                                break;

                        case SHOW_BRIEF_DAMAGE:
                        case SHOW_BRIEF_SELF_DAMAGE:
                                message("tell_object", str3d, ob);
                                break;

                        default:
                                message("tell_object", str3f, ob);
                                break;
                        }
                }
        }
}

void tell_object(object ob, string str)
{
	message("tell_object", str, ob);
}

varargs void tell_room(mixed ob, string str, object *exclude)
{
	if (ob) message("tell_room", str, ob, exclude);
}

void shout(string str)
{
	message("shout", str, users(), this_player());
}

void write(string str)
{
	if (this_player())
		message("write", str, this_player());
	else if (previous_object())
		message("write", str, previous_object());
	else
		efun::write(str);
}

varargs void say(string str, mixed exclude)
{
	if (living(previous_object()))
                message("say", str, environment(previous_object()), previous_object());
	else if (this_player())
		message("say", str, environment(this_player()), this_player());
}

void message(mixed arg, string message, mixed target, mixed exclude)
{
        efun::message(arg, message, target, exclude);
}

void message_system(string message)
{
	message("system", HIW "\n【系统提示】" + message + "\n" NOR,
                all_interactive(), 0);
}

int notify_fail(string msg)
{
        if (this_player()) 
        {
                this_player()->set_temp("notify_fail", msg);
                return efun::notify_fail(ESC "[256D" ESC "[K" + msg);
        } else
                return 0;
}

string query_fail_msg()
{
        return this_player()->query_temp("notify_fail");
}
