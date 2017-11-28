// skills.c
// last edit by naihe 15:07 04-4-27 见注释

#include <ansi.h>

inherit F_CLEAN_UP;

string *valid_types = ({
        "force",
        "dodge",
        "cuff",
        "strike",
        "finger",
        "hand",
        "claw",
        "sword",
        "blade",
        "staff",
        "hammer",
        "club",
        "whip",
        "dagger",
        "throwing",
        "unarmed",
        "parry",
        "magic",
        "medical",
        "poison",
        "chuixiao-jifa",
        "tanqin-jifa",
        "guzheng-jifa",
        "cooking",
});

int sort_skill(string sk1, string sk2, mapping spos);
int filter_for_enable(string skill, string skill1);
int filter_for_main(string skill, string skill1);
int filter_for_combine(string skill, string skill1);
int filter_for_knowledge( string skill );
int help(object me);
string get_str( string *ls, string n, mapping skl, mapping lrn, string *mapped );

int main(object me, string arg)
{
	object ob;
	mapping skl, lrn, map;
	string *sname, *mapped, str, skill1;
        string skillname, skcolor;
        string *basic;
        mixed  *lists;
        string *others;
        string fname;
        int valid_check;
        int lvl;
	int i, k;
	string *skill_k;
	int mark;
	int percent;

	seteuid(getuid());

        skill1 = 0;
	if (! arg)
	{
		ob = me;
	}
	else
	{
                string *temp;
			// by naihe, MUD 里有直接的 /help/skills , 所以本指令的 help 显示不出来，晕
			// 给它加个参数显示。
		if( arg == "-h" )
			return help(me);
		if (sscanf(arg, "%s of %s", skill1, arg) == 2)
                        ; else
                if (temp = explode(arg, " "))
                {
                        if (sizeof(temp) < 2)
                                arg = "me";
                        else
                                arg = implode(temp[0..sizeof(temp) - 2], " ");
                        skill1 = temp[sizeof(temp) - 1];

                        if (file_size(SKILL_D(skill1) + ".c") <= 0)
                        {
                                if (sizeof(temp) < 2)
                                        arg = skill1;
                                else
                                        arg += " " + skill1;
                                ob = present(arg, environment(me));
                                skill1 = 0;
                        }
                } else
                {
                        // if the user was not wizard, I will
                        // treat the arg as skill1, and the
                        // object he check is hiself.
                        if (! wizardp(me) && (! (ob = present(arg, environment(me))) ||
                            ! ob->is_character() ||
			    ! me->is_apprentice_of(ob)))
                        {
                                skill1 = arg;
                                arg = "me";
                        }
                }

		if (ob && ! ob->is_character())
			ob = 0;

                if (skill1 && file_size(SKILL_D(skill1) + ".c") <= 0)
                {
                        if (objectp(ob))
                        {
                                arg = 0;
                                skill1 = 0;
                        } else
                                return notify_fail("没有(" + skill1 +
						   ")这种技能。\n");
                }

                if (! ob || ! ob->is_character())
                {
        		if (arg == "me")
        			ob = me;
        		else
        			ob = present(arg, environment(me));
        
        		if (! ob || ! ob->is_character()) ob = find_player(arg);
        		if (! ob || ! ob->is_character()) ob = find_living(arg);
                }

		if (! ob || ! ob->is_character())
			return notify_fail("你要察看谁的技能？\n");
	}

        if (ob != me)
        {
                // call the player, if the player has override the
                // the function & return a nonzero valud, I will
                // return success.
                if ((int)ob->skills(me, skill1))
                        return 1;
        }

        if (ob == me || wizardp(me) ||
            ob->is_apprentice_of(me) ||
            me->is_apprentice_of(ob) ||
            me->query("couple/id") == ob->query("id") ||
            me->is_brother(ob))
                valid_check = 1;
        else
        {
                fname = me->query("league/league_name");
                if (stringp(fname) && fname == ob->query("league/league_name"))
                        valid_check = 1;
                else
                        valid_check = 0;
        }

        if (! valid_check)
		return notify_fail("只有巫师或有师徒/夫妻/结拜/同盟关系的人"
				   "才能察看他人的技能。\n");

	skl = ob->query_skills();
	if (! sizeof(skl))
	{
		write((ob==me ? "你" : ob->name()) +
		      "目前并没有学会任何技能。\n");
		return 1;
	}

        // calucate spos to sort
        sname = keys(skl);

        str = (ob == me ? "你" : ob->name()) + "目前所学到的";
        // filter array by skill1
        if (skill1)
        {
                // filter the skill array by skill1
                if (member_array(skill1, valid_types) != -1)
                {
                        // skill1 is a basic skill
                        sname = filter_array(sname, (: filter_for_enable :), skill1);
                        str += to_chinese(skill1) + "及相关技能";
                } else
                if (SKILL_D(skill1)->main_skill() &&
                    member_array(SKILL_D(skill1)->main_skill(), sname) == -1)
                {
                        // skill1 is a sub skill
                        skill1 = SKILL_D(skill1)->main_skill();
                        sname = filter_array(sname, (: filter_for_main :), skill1);
                        str += to_chinese(skill1) + "中的招式";
                } else
                {
                        sname = filter_array(sname, (: filter_for_combine :), skill1);
                        str += to_chinese(skill1) + "和可以激发的基础武技与能够互备的技能";
                }
        }
	else
	{
		str += "所有技能(共"+chinese_number(sizeof(skl))+"项)：";
		str = BBLU + HIY + str + "  (查看指令帮助：cha -h) "NOR;
		mark = 1;
	}

        if (! sizeof(sname))
        {
                write("你目前还没有掌握该技能。\n");
                return 1;
        }

        // sort all the skills
        // select all the basic skill of the skill list
        basic = filter_array(valid_types, (: member_array($1, $(sname)) != -1 :));

        // allocate the string array for each basic skill
        lists = allocate(sizeof(basic));

        // allocate the other skill for none apply to all the basic skill
        others = ({ });

        // select out all the special skill & other skill
        sname -= basic;
        for (i = 0; i < sizeof(sname); i++)
        {
                // let's check every special skill & other skill
                if (! sname[i]) continue;

                // enable for basic skill
                for (k = 0; k < sizeof(basic); k++)
                {
                        string main_skill;

                        if (SKILL_D(sname[i])->valid_enable(basic[k]))
                        {
                                // yes, I record this special skill
                                if (! lists[k])
                                        lists[k] = ({ sname[i] });
                                else
                                        lists[k] += ({ sname[i] });

                                // Is this a sub skill ?
                                if (main_skill = SKILL_D(sname[i])->main_skill())
                                {
                                        // yes, I select out all the other sub skills
                                        int st;
                                        for (st = i + 1; st < sizeof(sname); st++)
                                                if (sname[st] &&
                                                    SKILL_D(sname[st])->main_skill() == main_skill)
                                                {
                                                        // record it
                                                        lists[k] += ({ sname[st] });
                                                        sname[st] = 0;
                                                }
                                }

                                break;
                        }
                }

                if (k == sizeof(basic))
                        // It can enable on basic skill, it must be a others skill
                        others += ({ sname[i] });
        }

        // let me combine all the skill in string array: sname
        sname = ({ });
        for (i = 0; i < sizeof(basic); i++)
        {
                sname += ({ basic[i] });
                if (lists[i]) sname += lists[i];
        }
        sname += others;

        // get the skill map
	map = ob->query_skill_map();
	if (mapp(map)) mapped = values(map);
	if (! mapped) mapped = ({});

	lrn = ob->query_learned();
	if (! mapp(lrn)) lrn = ([]);


	// 奈何修改 查询所有技能时，将技能分类显示
	// 如果 mark = 1，表示查询的是所有技能，将使用分类的方法。
	// 否则使用旧的方式。不过说实在的，旧的统计方式是否烦琐了点？

	if( mark )
	{
		// 好，开始组合信息
		str += "\n\n";
		//str += HIC "≡" HIY "──────────────────────────" HIC "≡\n" NOR;

		// 将知识类技能得到，并组合其信息
		skill_k = ({ });
		for( i=sizeof(sname)-1; i>=0; i-- )
		{
			skill_k = filter_array( sname, (: filter_for_knowledge :), sname[i] );
		}
		// 不知道是什么原因，有的技能属于“杂学”，却又属于“基本XX”
		// 那么，将这一类的剔除，让它分类为“基本技能”类
		skill_k -= basic;
		// 显示该类技能信息
		str += get_str( skill_k, "各类杂学", skl, lrn, mapped );

		// 基本技能类信息，这个索引在前边已经得到了，是“basic”。显示它
		str += get_str( basic, "基本技能", skl, lrn, mapped );

		// 其它技能，即： 所有技能 减 知识 减 基本， 即：
		str += get_str( sname - skill_k - basic, "特殊技能", skl, lrn, mapped );

		// OK! 完毕。
		// 信息尾，结束
		//str += HIC "≡" HIY "──────────────────────────" HIC "≡\n" NOR;
	}
	else
	{
		// 这里是原来的显示方法
		str += "\n\n";
		str += HIC "≡" HIY "──────────────────────────" HIC "≡\n" NOR;
 
 	      	for (i = 0; i < sizeof(sname); i++)
		{
        	        skillname = to_chinese(sname[i]);
                	switch (strlen(skillname))
	                {
	        	        case 6:
        	        	        skillname = sprintf("%c%c %c%c %c%c", skillname[0], skillname[1],
                                             skillname[2], skillname[3],
                                             skillname[4], skillname[5]);
                        	break;
                		case 4:
		                        skillname = sprintf("%c%c    %c%c", skillname[0], skillname[1],
                                             skillname[2], skillname[3]);
                	        break;
	                }
	                if (member_array(sname[i], valid_types) != -1)
        	                skcolor = CYN;
                	else
                        	skcolor = WHT;
	                if (! objectp(find_object(SKILL_D(sname[i]))) &&
        	            ! objectp(load_object(SKILL_D(sname[i]))))
                	{
                        	write(HIR "Error(No such skill):" + sname[i] + "\n" NOR);
	                        continue;
        	        }
	                lvl = skl[sname[i]];
			percent = lrn[sname[i]] * 100 / ((lvl + 1) * (lvl + 1) + 1);
			if (percent > 100) percent = 100;
			str += sprintf("%s%s%s%-40s" NOR WHT " - %4d/%3d%%\n" NOR, 
        	                skcolor,
				(lrn[sname[i]] >= (skl[sname[i]]+1) * (skl[sname[i]]+1)) ? HIM : "",
				(member_array(sname[i], mapped)==-1? "  ": "□"),
				skillname + " (" + sname[i] + ")",
				lvl, percent);
		}
		str += HIC "≡" HIY "──────────────────────────" HIC "≡\n" NOR;
	}
	me->start_more(str);
	return 1;
}

#define		COLORS		NOR	// 显示时的主颜色

string get_str( string *ls, string n, mapping skl, mapping lrn, string *mapped )
{
	string str = "", skillname;
	int size, i, percent, lvl;

	if( !ls || !(size=sizeof(ls)) )
		return "";

	str += sprintf( COLORS"┌"BGRN+WHT"%|20s"NOR+COLORS"────────────────┐\n"NOR,
					chinese_number(size)+"项"+n );
	for( i=0; i<size; i++ )
	{
		skillname = to_chinese( ls[i] );
		// 发现错误时报告
		if (! objectp(find_object(SKILL_D( ls[i] ))) &&
       	            ! objectp(load_object(SKILL_D( ls[i] ))) )
               	{
			write(HIR "技能错误！没有这个技能：" +  ls[i]  + "\n" NOR);
			continue;
		}
		lvl = skl[  ls[i]  ];
		percent = lrn[  ls[i]  ] * 100 / ((lvl + 1) * (lvl + 1) + 1);
		if (percent > 100)
			percent = 100;
		if (percent < 0 )
			percent = 0;
               	switch (strlen(skillname))
                {
        	        case 6:
       	        	        skillname = sprintf("%c%c %c%c %c%c",
					skillname[0], skillname[1],
					skillname[2], skillname[3],
					skillname[4], skillname[5]);
                        	break;
               		case 4:
	                        skillname = sprintf("%c%c    %c%c",
				skillname[0], skillname[1],
				skillname[2], skillname[3]);
				break;
		}
		str += sprintf( COLORS"│%s%s%-38s - %s%4d"NOR+COLORS"/%3d%%│\n"NOR,
			(lrn[ ls[i] ] >= (skl[ ls[i] ]+1) * (skl[ ls[i] ]+1)) ? HIM : "",
			member_array( ls[i] , mapped)== -1 ? "  ": HIG"□"NOR+COLORS,
			skillname + " (" +  ls[i]  + ")",
			lvl < 99 ? GRN : lvl < 199 ? WHT : lvl < 299 ? HIB : lvl < 399 ?
				 HIY : lvl < 499 ? HIW : lvl < 599 ? HIC : lvl < 699 ? HIG : lvl < 799 ? HIM : HIR,
			lvl, percent
			);
	}
	str += COLORS"└──────────────────────────┘\n"NOR;
	return str;
}

int filter_for_knowledge( string skill )
{
	return ( SKILL_D(skill)->type() == "knowledge" );
}

int filter_for_enable(string skill, string skill1)
{
        return (skill == skill1) || (SKILL_D(skill)->valid_enable(skill1));
}

int filter_for_main(string skill, string skill1)
{
        return (SKILL_D(skill)->main_skill() == skill1);
}

int filter_for_combine(string skill, string skill1)
{
        return (SKILL_D(skill1)->valid_enable(skill)) ||
               (SKILL_D(skill)->valid_combine(skill1)) ||
               (skill == skill1);
}

int help(object me)
{
	write(@HELP
指令格式 : skills | cha [<技能名> | <某人>]

这个指令可以让你查询所学过的技能。你也可以指定一个和你
有师徒关系的对象，用 skills 可以查知对方的技能状况。也
可以查询某人某项技能的情况，比如(skills taiji-shengong
of song)或者是 (skills literate of me)。用这种方法查询
时分以下几种情况：

①、如果查询的技能是一种基本武技，将同时返回所有在这种
    基本武技的基础上能  够激发的武功技能。

②、如果查询的技能是一种武技中的某些招式路数，比如查询
    降龙十八掌，或是降龙十八掌中的神龙摆尾等等，则显示
    玩家学到与之相关的招式路数。如果玩家已经将这种武技
    融会贯通则按照普通技能来显示。

③、如果查询的技能是一种普通的武技，则显示可以激发的基
    本武技基础和可以与之互备的武功。

使用该命令可以了解你学到的武功技能。玩家查询的时候不需
要指明人物对象参数，可以直接输入<技能名>参数。

相关指令：skill

HELP);
    return 1;
}
