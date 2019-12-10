// set.c
#include <ansi.h>

#define MAX_ENV_VARS	40
 
int help();

#define LIST_TERM               1
#define STRING_TERM             2
#define NUMBER_TERM             4
#define NON_ZERO                8
#define ENABLE_COLOR            16
#define NON_NEG                 0x10
#define WIZ_ONLY                0x80

mapping query_terms() { return ([
	"auto_ban"	  : LIST_TERM,
        "auto_drinkout"   : 0,
        "auto_get"        : 0,
	"auto_invite"	  : LIST_TERM,
	"auto_regenerate" : 0,
        "auto_say"        : 0,
	"brief"           : 0,
	"combatd"         : 0,
        "careful"         : 0,
	"can_accept"      : LIST_TERM,
	"can_emote"       : LIST_TERM,
	"can_snoop"       : LIST_TERM,
	"can_tell"        : LIST_TERM,
        "default_sign"    : NUMBER_TERM | NON_NEG | NON_ZERO,
        "halt_age"        : 0,
        "jam_talk"        : 0,
        "keep_idle"       : 0,
        "look_window"     : 0,
	"no_accept"       : LIST_TERM,
	"no_learn"        : LIST_TERM,
	"no_autoultra"    : 0,
        "no_emote"        : LIST_TERM,
	"no_more"         : 0,
	"no_teach"        : 0,
	"no_tell"         : LIST_TERM,
	"no_story"        : 0,
        "no_follow"       : 0,
        "prompt"          : 0,
	"public"          : 0,
        "pure_say"        : 0,
        "sign1"           : STRING_TERM,
        "sign2"           : STRING_TERM,
        "sign3"           : STRING_TERM,
        "sign4"           : STRING_TERM,
        "sign5"           : STRING_TERM,
        "captcha"         : STRING_TERM,
        "show_map"        : 0,
	"wimpy"           : 0,
        "wimpy_apply"     : 0,
// wiz term
	"combat_test"     : WIZ_ONLY,
	"invisible"       : WIZ_ONLY,
	"immortal"        : WIZ_ONLY,
	"msg_out"         : WIZ_ONLY | STRING_TERM | ENABLE_COLOR,
	"msg_in"          : WIZ_ONLY | STRING_TERM | ENABLE_COLOR,
	"no_prefix"	  : WIZ_ONLY,
]); }

mapping query_env_domains() { return ([
	"combatd" : ([
		"normal" : 0,
		"damage" : 1,
		"brief"  : 2,
		"self"   : 3,
		"null"   : 4,
	]),
        "jam_talk" : ([
                "none" : 0,
                "half" : 1,
                "abs"  : 2,
        ]),
]); }

int main(object me, string arg)
{
        int i;
	int k;
        mapping env_domains;
        string msg;

        mapping term_map;
        string *terms;
	string term;
	mixed data;
	mapping env;
	mapping d;
	string *ks;
        mixed *bs;

        int opt_add, opt_del;
 
	env = me->query("env");

        term_map = query_terms();
        env_domains = query_env_domains();
 
	if (! arg || arg == "")
	{
		msg = "你目前设定的环境变数有：\n";
		if (! mapp(env) || ! sizeof(env))
			msg = "你目前没有设定任何环境变数。\n";
		else
                {
			terms = sort_array(keys(env), 1);
			for (i = 0; i < sizeof(terms); i++)
			{
				if (mapp(d = env_domains[terms[i]]))
				{
					ks = keys(d);
					for (k = 0; k < sizeof(ks); k++)
						if (d[ks[k]] == env[terms[i]])
							break;
					if (k < sizeof(ks))
					{
						msg += sprintf("%-20s  %O\n",
						       terms[i], ks[k]);
						continue;
					}
				}
				msg += sprintf("%-20s  %O\n", terms[i], env[terms[i]]);
			}
		}
                write(msg);
		return 1;
	}
 
        opt_add = 0;
        opt_del = 0;
	if (sscanf(arg, "%s -a %s", term, data) == 2 ||
            sscanf(arg, "-a %s %s", term, data) == 2)
        {
                opt_add = 1;
	} else
	if (sscanf(arg, "%s -d %s", term, data) == 2 ||
            sscanf(arg, "-d %s %s", term, data) == 2)
        {
                opt_del = 1;
	} else
	if (sscanf(arg, "%s %s", term, data) != 2)
        {
		term = arg;
                if (term_map[term] & STRING_TERM ||
                    term_map[term] & NUMBER_TERM)
                        return notify_fail("你必须指明这个参数的内"
                                           "容，否则请用 unset 取消这个参数。\n");
                else
		        data = "YES";
	}
 
	if (data == "")
		return notify_fail("设定的参数值不能为空。\n");

        if (term_map[term] & NUMBER_TERM)
        {
                sscanf(data, "%d", data);
		if (! intp(data)) data = 0;
                if ((term_map[term] & NON_ZERO) && ! data)
                        return notify_fail("这个参数值不能设置为零。\n");

                if ((term_map[term] & NON_NEG) && data < 0)
                        return notify_fail("这个参数值不能设置为负数。\n");
        } else
        if (term_map[term] & STRING_TERM &&
            term_map[term] & ENABLE_COLOR)
        {
                data = color_filter(data);
                if (strsrch(data, ESC) != -1)
                        data += NOR;
        }

	if (term && term != "")
        {
		if (mapp(env) && undefinedp(env[term]) && sizeof(env) >= MAX_ENV_VARS)
			return notify_fail("你设的环境变数太多了，请先用 unset 删掉几个吧。\n");

		if (undefinedp(term_map[term]))
			return notify_fail("你只能设定规定的参数，请参见help settings。\n");

        	if ((wiz_level(me) == 0) && (term_map[term] & WIZ_ONLY))
                	return notify_fail("只有巫师能用这个设定。\n");

		if (term_map[term] & LIST_TERM)
                {
                        if (! stringp(data) || data == "YES")
			        return notify_fail("列表参数只能以字符串为取值。\n");

                        ks = explode(data, ",") - ({ "" });
                        bs = ({ });
                        for (i = 0; i < sizeof(ks); i++)
                        {
                                if (member_array(ks[i], bs) == -1)
                                        bs += ({ ks[i] });
                        }
                        data = implode(bs, ",");
                }

                if (opt_add || opt_del)
                {
                        if (! (term_map[term] & LIST_TERM))
                                return notify_fail("这个参数不具有列表属性，不"
                                                   "能使用-a或则是-d参数。\n");
                        if (opt_add)
                                data = add_sub(data, me->query("env/" + term));
                        else
                                data = remove_sub(data, me->query("env/" + term));
			if (strlen(data) > 256)
				return notify_fail("参数取值太长了。\n");

                        if (! data)
                        {
                                me->delete("env/" + term);
                                write("取消环境参数：" + term + "\n");
                                return 1;
                        }
                }

		if (mapp(d = env_domains[term]))
		{
			if (! undefinedp(d[data])) data = d[data];

			// check the data
			ks = keys(d);
			for (k = 0; k < sizeof(ks); k++)
				if (d[ks[k]] == data) break;
			if (k >= sizeof(ks))
			{
				write("该项参数不能设置成该值，请参见help settings。\n");
				return 1;
			}
		        me->set("env/" + term, data);
			write(sprintf("设定环境变数：%s = %O\n", term, ks[k]));
			return 1;
		} else
                if (stringp(data) && ! (term_map[term] & LIST_TERM) &&
		    ! (term_map[term] & STRING_TERM))
                        sscanf(data, "%d", data);

	        me->set("env/" + term, data);
		write(sprintf("设定环境变数：%s = %O\n", term, data));
		return 1;
	}
	return help();
}
 
int help()
{
	write(@TEXT
指令格式：set <变数名> -a | -d [<参数>]
 
这个指令让你设定一些环境变数，不加参数时会显示你目前设定的环境变数，不指定
变数值，则内定值为 "YES"。如果使用了-a参数，表示将参数加入到原有的参数中，
如果使用了-d参数则表示将参数从原有的参数中去掉。只有具有多值属性的参数才能
使用这两个参数。

比如no_tell参数，可以设定为不收听test和work的讲话：
set no_tell test,work

如果这时候你不希望收听nothing的讲话，则可以：
set no_tell -a nothing  也可以：set no_tell test,work,nothing

如果这时候你希望收听test的讲话，则可以：
set no_tell -d test     也可以：set no_tell work,nothing

取消变数设定请用 unset 指令。

至於有哪些环境变数可以设定，请见 help settings。
TEXT
	);
	return 1;
}
