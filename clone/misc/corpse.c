// corpse.c
// Updated by Doing

inherit ITEM;
inherit F_CUTABLE;

int decayed;
STATIC_VAR_TAG int not_cut = 0;

void create()
{
	set_name("无名尸体", ({ "corpse" }));
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("default_clone", "/clone/misc/part");
                set("parts", ([
                        "left arm" : ({ 0, "条", "左臂", "手臂", "arm",
                                        ([ "left hand": "hand" ]),
                                        "剁下", 0 }),
                        "left hand": ({ 1, "只", "左手", "手掌", "hand",
                                        ([ "left thumb"        : "thumb",
                                           "left forefinger"   : "forefinger",
                                           "left middle finger": "middle finger",
                                           "left ring finger"  : "ring finger",
                                           "left little finger": "little finger" ]),
                                        "剁下", 0 }),
                        "left thumb"         : ({ 2, "根", "左手大拇指", "大拇指", "thumb",
                                                  0, 0, 0 }),
                        "left forefinger"    : ({ 2, "根", "左手食指", "食指", "forefinger",
                                                  0, 0, 0 }),
                        "left middle finger" : ({ 2, "根", "左手中指", "中指", "middle finger",
                                                  0, 0, 0 }),
                        "left ring finger"   : ({ 2, "根", "左手无名指", "无名指", "ring finger",
                                                  0, 0, 0 }),
                        "left little finger" : ({ 2, "根", "左手小指", "小指", "little finger",
                                                  0, 0, 0 }),
                        "right arm" : ({ 0, "条", "右臂", "手臂", "arm",
                                        ([ "right hand": "hand" ]),
                                        "剁下", 0 }),
                        "right hand": ({ 1, "只", "右手", "手掌", "hand",
                                        ([ "right thumb"        : "thumb",
                                           "right forefinger"   : "forefinger",
                                           "right middle finger": "middle finger",
                                           "right ring finger"  : "ring finger",
                                           "right little finger": "little finger" ]),
                                        "剁下", 0 }),
                        "right thumb"         : ({ 2, "根", "右手大拇指", "大拇指", "thumb",
                                                   0, 0, 0 }),
                        "right forefinger"    : ({ 2, "根", "右手食指", "食指", "forefinger",
                                                   0, 0, 0 }),
                        "right middle finger" : ({ 2, "根", "右手中指", "中指", "middle finger",
                                                   0, 0, 0 }),
                        "right ring finger"   : ({ 2, "根", "右手无名指", "无名指", "ring finger",
                                                   0, 0, 0 }),
                        "right little finger" : ({ 2, "根", "右手小指", "小指", "little finger",
                                                   0, 0, 0 }),
                        "left leg" : ({ 0, "条", "左腿", "人腿", "leg",
                                        ([ "left foot": "foot" ]),
                                         "剁下", 0 }),
                        "left foot": ({ 1, "只", "左脚", "人脚", "foot",
                                        ([ "left toes"        : "toes", ]),
                                        "剁下", 0 }),
                        "left toes": ({ 2, "根", "左脚趾", "脚趾", "toes",
                                                       0, 0, 0 }),
                        "right leg" : ({ 0, "条", "右腿", "人腿", "leg",
                                        ([ "right foot": "foot" ]),
                                         "剁下", 0 }),
                        "right foot": ({ 1, "只", "右脚", "人脚", "foot",
                                        ([ "right toes"        : "toes", ]),
                                        "剁下", 0 }),
                        "right toes": ({ 2, "根", "右脚趾", "脚趾", "toes",
                                                       0, 0, 0 }),
                        "head"      : ({ 0, "颗", "头", "人头", "head",
                                        ([ "left eye"  : "left eye",
                                           "right eye" : "right eye",
                                           "nose"      : "nose",
                                           "left ear"  : "left ear",
                                           "right ear" : "right ear",
                                           "hair"      : "hair",
                                           "tongue"    : "tongue", ]),
                                        "砍下", "/clone/misc/head" }),
                        "left eye"  : ({ 1, "只", "左眼", "眼珠", "eye",
                                         0, "挖出", 0, }),
                        "right eye" : ({ 1, "只", "右眼", "眼珠", "eye",
                                         0, "挖出", 0, }),
                        "left ear"  : ({ 1, "只", "左耳", "耳朵", "ear",
                                         0, 0, 0, }),
                        "right ear" : ({ 1, "只", "右耳", "耳朵", "ear",
                                         0, 0, 0, }),
                        "nose"      : ({ 1, "只", "鼻子", "鼻子", "nose",
                                         0, 0, 0, }),
                        "hair"      : ({ 1, "束", "头发", "头发", 0,
                                         0, 0, "/clone/misc/hair", }),
                        "tongue"    : ({ 1, "条", "舌头", "舌头", 0,
                                         0, 0, 0, }),
                        "genitals"  : ({ 1, "根", "生殖器", 0, 0,
                                         0, 0, 0, }),
                ]));
        	set("unit", "具" );
                set("main_part_level", 0);
        }
        
	set("long", "这是一具无名尸体。\n");
	decayed = 0;
        if( clonep(this_object()) ) call_out("decay", 60, 1);
}

int is_corpse() { return decayed < 2; }
int is_character() { return decayed < 1; }
int is_container() { return 1; }

string short() { return name() + "(" + capitalize(query("id")) + ")"; }

string long() { return ::long() + extra_desc(); }

void decay(int phase)
{
        string msg;
        object env;

        env = environment();
	decayed = phase;
	switch (phase)
        {
	case 1:
                set("owner_id", "unknow");
		msg =  name(1) + "开始腐烂了，发出一股难闻的恶臭。\n";
                delete("victim_name");
                delete("owner_id");
		switch (query("gender"))
                {
		case "男性":
			set_name("腐烂的男尸", ({ "corpse", "尸体" }));
                        break;

		case "女性":
			set_name("腐烂的女尸", ({ "corpse", "尸体" }));
                        break;

		default:
			set_name("腐烂的尸体", ({ "corpse", "尸体" }));
		}
		set("long",	"这具尸体显然已经躺在这里有一段时间了，正散发著一股腐尸的味道。\n");
                call_out("decay", 60, phase + 1);
		break;
	case 2:
                delete("parts");
		msg = name(1) + "被风吹乾了，变成一具骸骨。\n";
		set_name("枯乾的骸骨", ({ "skeleton", "骸骨" }) );
		set("long", "这副骸骨已经躺在这里很久了。\n");
                call_out("decay", 30, phase + 1);
		break;
	case 3:
		msg = "一阵风吹过，把" + name(1) + "化成骨灰吹散了。\n";
		if( env )
                        all_inventory(this_object())->move(env);
                tell_room(env, msg);
		destruct(this_object());
		return;
	}

        while (env && env->is_character())
                env = environment(env);

        if (env) tell_room(env, msg);
}

int do_cut(object me, string arg)
{
        object ob;

        if (not_cut)
                return 0;

        if (! ::do_cut(me, arg))
                return 0;

        if (! objectp(ob = query_temp("handing")))
                return 1;

        if (arg != "right hand" &&
            arg != "right thumb" &&
            arg != "right middle finger")
                return 1;

        delete_temp("handing");
        message("vision", "“啪啦”一声，" + ob->name() + "掉了下来。\n",
                          environment());
        ob->move(environment());
        return 1;
}

int make_corpse(object victim, object killer)
{
        int i;
        object env;
        object aob, dob;
        object *inv;

        set_name(victim->name(1) + "的尸体", ({ "corpse" }));
        set("long", victim->long()
                + "然而，" + gender_pronoun(victim->query("gender"))
                + "已经死了，只剩下一具尸体静静地躺在这里。\n");
        set("class", victim->query("class"));
        set("age", victim->query("age")); 
        set("gender", victim->query("gender"));
        set("victim_name", victim->name(1));
        set_weight(victim->query_weight());
        set_max_encumbrance(victim->query_max_encumbrance());
        env = environment(victim);
        while (env && environment(env)) env = environment(env);
        move(env);
        set_temp("handing", victim->query_temp("handing"));
        if (victim->query("can_speak"))
        {
                set("owner_id", victim->query("id"));
                set("is_player", userp(victim));
                set("defeated_by", dob = victim->query_defeated_by());
                set("defeated_by_who", victim->query_defeated_by_who());
                if (objectp(killer))
                        set("killed_by", killer->query("id"));
                // 这是为了帮手设计的
                if (! objectp(dob)) dob = killer;
                if (objectp(dob) &&
                    objectp(aob = dob->query_temp("quest/assist")))
                {
                        // 我正在帮助某人(aob)，如果某人的确想杀
                        // 死该人的话，则我记录之。
                        if (aob->is_killing(victim->query("id")))
                                // 记录此人帮助的对象
                                set("assist", aob);
                }
        } else
        {
                // can not cut can_speak object
                not_cut = 1;
        }
 
        if (victim->query("class") == "bonze")
                set("no_cut/hair", "它没有头发啊，等它再长出来好像来不及了。\n");

        switch (victim->query("gender"))
        {
        case "女性":
                set("no_cut/genitals", "看清楚了，这可是一具女尸");
                break;

        case "男性":
                break;

        case "无性":
                set("no_cut/genitals", "看清楚了，这位生前就已经做过"
                                       "手术了，你不必再操心了。\n");
                break;
        default:
                set("no_cut/genitals", "看清楚了，这不是人的尸体。\n");
                break;
        }

        // Don't let wizard left illegal items in their corpses.
        if (! wizardp(victim))
        {
                inv = all_inventory(victim);
                inv->owner_is_killed(killer);
                inv -= ({ 0 });
                i = sizeof(inv);
                while (i--)
                {
                        if ((string)inv[i]->query("equipped") == "worn")
                        {
                                inv[i]->move(this_object());
                                if (! inv[i]->wear())
                                        inv[i]->move(environment(victim));
                        } else
                                inv[i]->move(this_object());
                } 
        }
        return 1;
}
