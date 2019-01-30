// emoted.c

#include <net/macros.h>
#include <ansi.h>

// #pragma optimize
// #pragma save_binary

inherit F_SAVE;
inherit F_DBASE;
mapping emote;

//      The emote mapping contains the data base of emote definitions. Each emote
//      is defined in a sub-mapping with the following structure:
//
//      myself  - the message emoter will see
//      target  - the message the target will see when targeted
//      others  - the message others will see when no argument.
//
//      The emote mapping is indexed with the emote 'pattern' instead of emote
//      verb. For example, typing "smile" without argument will cause the daemon
//      search the emote mapping with "smile" as key, and typing "smile someone"
//      will cause the daemon search the emote mapping with "smile $" pattern as
//      the key, while $ means one argument.
//
//      In the message string, the following substitutions will be applied before
//      sending the messages:
//
//      $N              - name of emoter
//      $n              - name of target
//      $P              - pronoun of emoter
//      $p              - pronoun of target
//
//      Original by Annihilator@ESII (11/09/94)
//      $C              - very close call of emoter
//      $c              - close call of target
//      $R              - respect calling of target
//      $r              - rude calling of target
//      $S              - self calling of emoter
//      $s              - self-rude calling of emoter
//      aboved added by Xiang@XKX

int     set_emote(string pattern, mapping def, int raw);
mapping query_emote(string pattern);

void create()
{
        if (! restore() && ! mapp(emote))
                emote = ([]);
}

int remove()
{
        save();
        return 1;
}

string query_save_file() { return DATA_DIR + "emoted"; }

// command_hook() of F_COMMAND call this as an alternate command processor.
// CHANNEL_D also calls this to get emote message.
varargs mixed do_emote(object me, string verb, string arg, int channel_emote, string who, string default_color)
{
        string str, my_gender, target_gender, msg_postfix;
        string my_name, tar_name;
        object target;
        string no_emote, can_emote;
        mapping def;
        mapping rwho = ([ ]);

        if (! default_color) default_color = channel_emote ? "" : CYN;
        if (who) who += default_color;
        my_name = me->name() + default_color;
        if (my_name[0] == 27) my_name = NOR + my_name;

        if (channel_emote && channel_emote == 4)
        {
                // 根据其他MUD返回的信息做生成EMOTE表情
                if (sscanf(arg,"mud=%s name=%s id=%s age=%d gender=%s respect=%s rude=%s ",
                                        rwho["mud"],
                                        rwho["name"],
                                        rwho["id"],
                                        rwho["age"],
                                        rwho["gender"],
                                        rwho["respect"],
                                        rwho["rude"]) != 7)
                                return 0;

                if (! mapp(def = query_emote(verb)))
                {
                        tell_object(me, "没有 " + verb + " 这个表情动词。\n");
                        return 0;
                }

                if (stringp(str = def["others_target"]))
                {
                        str = replace_string(str, "$N", sprintf("%s(%s@%s)", my_name, capitalize(me->query("id")), upper_case(INTERMUD_MUD_NAME)));
                        str = replace_string(str, "$C", RANK_D->query_self_close(0, me, me->query("age"), rwho["age"]));
                        str = replace_string(str, "$c", RANK_D->query_close(rwho["gender"], me->query("age"), rwho["age"]));
                        str = replace_string(str, "$R", rwho["respect"]);
                        str = replace_string(str, "$r", rwho["rude"]);
                        str = replace_string(str, "$p", gender_pronoun(rwho["gender"]));
                        str = replace_string(str, "$n", sprintf("%s(%s@%s)", rwho["name"], capitalize(rwho["id"]), who));
                        str = replace_string(str, "$S", RANK_D->query_self(me));
                        str = replace_string(str, "$s", RANK_D->query_self_rude(me));
                }
                return str;
        }

        if (! environment(me))
                return 0;

        if (! mapp(def = query_emote(verb)))
                return 0;

        if (me->ban_say()) return 0;

        if (! channel_emote)
        {
                if (me->query("doing") == "scheme")
                {
                        if (me->query("jing") < 100)
                                return notify_fail("你现在的精神不济，等一会儿吧。\n");
                        me->add("jing", -50);
                }
        }

        // Determine the pattern to be searched and the target.
        if (stringp(arg) && arg != "")
	{
                target = present(arg, environment(me));

                if (! objectp(target) || ! target->is_character())
		{
                        // If not channel emote, only search target in our environment.
                        if (! channel_emote) return 0;
                        target = find_player(arg);
                        if (! objectp(target))  return 0;
                }

                if (! target->is_character() || ! me->visible(target))
                        return notify_fail("你要对谁做这个动作？\n");

                no_emote = target->query("env/no_emote");
        	if (! wizardp(me) && userp(me) && (no_emote == "all" || no_emote == "ALL" ||
        	    is_sub(me->query("id"), no_emote)))
                {
                        can_emote = target->query("env/can_emote");
                        if (! is_sub(me->query("id"), can_emote))
        		        return notify_fail("这个人不想接受你的动作。\n");
                }

                tar_name = target->name() + default_color;
                if (tar_name[0] == 27) tar_name = NOR + tar_name;

                target_gender = target->query("gender");
                if (target == me)
		{
                        msg_postfix = "_self";
                        target = 0;
                } else msg_postfix = "_target";
        } else msg_postfix = "";

        my_gender = me->query("gender");

        if (stringp(str = def["myself" + msg_postfix]))
	{
                str = replace_string(str, "$N", who ? who : my_name);
                str = replace_string(str, "$P", gender_self(my_gender));
                str = replace_string(str, "$S", RANK_D->query_self(me));
                str = replace_string(str, "$s", RANK_D->query_self_rude(me));
                if (objectp(target))
		{
                        str = replace_string(str, "$C", RANK_D->query_self_close(target));
                        str = replace_string(str, "$c", RANK_D->query_close(target));
                        str = replace_string(str, "$R", RANK_D->query_respect(target));
                        str = replace_string(str, "$r", RANK_D->query_rude(target));
                        str = replace_string(str, "$n", tar_name);
                        str = replace_string(str, "$p", gender_pronoun(target_gender));
                }
                if (! channel_emote)
                        message("emote", CYN + str + NOR, me);
        }

        if (objectp(target) && stringp(str = def["target"]))
	{
                str = replace_string(str, "$N", who ? who : my_name);
                str = replace_string(str, "$P", gender_pronoun(my_gender));
                str = replace_string(str, "$S", RANK_D->query_self(me));
                str = replace_string(str, "$s", RANK_D->query_self_rude(me));
                str = replace_string(str, "$C", RANK_D->query_self_close(target));
                str = replace_string(str, "$c", RANK_D->query_close(target));
                str = replace_string(str, "$R", RANK_D->query_respect(target));
                str = replace_string(str, "$r", RANK_D->query_rude(target));
                str = replace_string(str, "$n", tar_name);
                str = replace_string(str, "$p", gender_self(target_gender));
                if (! channel_emote)
                        message("emote", CYN + str + NOR, target);
        }

        if (stringp(str = def["others" + msg_postfix]))
	{
                str = replace_string(str, "$N", who ? who : my_name);
                str = replace_string(str, "$P", gender_pronoun(my_gender));
                str = replace_string(str, "$S", RANK_D->query_self(me));
                str = replace_string(str, "$s", RANK_D->query_self_rude(me));
                if (objectp(target))
		{
                        str = replace_string(str, "$C", RANK_D->query_self_close(target));
                        str = replace_string(str, "$c", RANK_D->query_close(target));
                        str = replace_string(str, "$R", RANK_D->query_respect(target));
                        str = replace_string(str, "$r", RANK_D->query_rude(target));
                        str = replace_string(str, "$n", tar_name);
                        str = replace_string(str, "$p", gender_pronoun(target_gender));
                }
                if (! channel_emote)
		{
                        str = CHANNEL_D->remove_addresses(str,0);
                        message("emote", CYN + str + NOR, environment(me), ({me, target}));
                }
                else return str;
        }

        // Let NPC know we are doing emote on him.
        if (objectp(target)) target->relay_emote(me, verb);
        me->ban_say(1);

        return 1;
}

#define UPDATE_TIME             0
#define MSG_MYSELF              1
#define MSG_OTHERS              2
#define MSG_MYSELF_SELF         3
#define MSG_OTHERS_SELF         4
#define MSG_MYSELF_TARGET       5
#define MSG_TARGET              6
#define MSG_OTHERS_TARGET       7
#define UPDATE_USER             8

int set_emote(string pattern, mapping def, int raw)
{
        mixed data;
        string temp;

        data = allocate(UPDATE_USER + 1);
        data[UPDATE_TIME] = def["time"];
        data[UPDATE_USER] = def["updated"];

        // record message: class 1
        data[MSG_MYSELF] = def["myself"];

        if (stringp(temp = data[MSG_MYSELF]))
                temp = replace_string(temp, "$P", "$N");

        if (temp == def["others"])
                data[MSG_OTHERS] = 0;
        else
                data[MSG_OTHERS] = def["others"];

        // record message: class 2
        data[MSG_MYSELF_SELF] = def["myself_self"];

        if (stringp(temp = data[MSG_MYSELF_SELF]))
                temp = replace_string(temp, "$P", "$N");
        if (temp == def["others_self"])
                data[MSG_OTHERS_SELF] = 0;
        else
                data[MSG_OTHERS_SELF] = def["others_self"];

        // record message: class 3
        data[MSG_MYSELF_TARGET] = def["myself_target"];

        if (stringp(temp = data[MSG_MYSELF_TARGET]))
                temp = replace_string(temp, "$P", "$N");

        if (temp == def["others_target"])
                data[MSG_OTHERS_TARGET] = 0;
        else
                data[MSG_OTHERS_TARGET] = def["others_target"];

        if (stringp(temp))
                temp = replace_string(temp, "$n", "$p");
        if (temp == def["target"])
                data[MSG_TARGET] = 0;
        else
                data[MSG_TARGET] = def["target"];

        emote[pattern] = data;
        if (! raw) save();
        return 1;
}

int delete_emote(string pattern)
{
        map_delete(emote, pattern);
        save();
        return 1;
}

string *query_emote_data(string pattern)
{
        return emote[pattern];
}

mapping query_emote(string pattern)
{
        mixed data;
        mapping def;
        string temp;

        if (undefinedp(data = emote[pattern]))
                return 0;

        if (mapp(data))
                return data;

        def = ([ ]);
        def["time"] = data[UPDATE_TIME];
        def["updated"] = data[UPDATE_USER];

        // restore message: class 1
        def["myself"] = data[MSG_MYSELF];

        if (stringp(temp = data[MSG_OTHERS]))
                def["others"] = temp;
        else
        if (stringp(temp = data[MSG_MYSELF]))
                def["others"] = replace_string(temp, "$P", "$N");

        // restore message: class 2
        def["myself_self"] = data[MSG_MYSELF_SELF];

        if (stringp(temp = data[MSG_OTHERS_SELF]))
                def["others_self"] = temp;
        else
        if (stringp(temp = data[MSG_MYSELF_SELF]))
                def["others_self"] = replace_string(temp, "$P", "$N");

        // restore message: class 3
        def["myself_target"] = data[MSG_MYSELF_TARGET];

        if (stringp(temp = data[MSG_OTHERS_TARGET]))
                def["others_target"] = temp;
        else
        if (stringp(temp = data[MSG_MYSELF_TARGET]))
        {
                temp = replace_string(temp, "$P", "$N");
                def["others_target"] = temp;
        }

        if (stringp(data[MSG_TARGET]))
                def["target"] = data[MSG_TARGET];
        else
        if (stringp(temp))
                def["target"] = replace_string(temp, "$n", "$p");

        return def;
}

string *query_all_emote()
{
        return keys(emote);
}
