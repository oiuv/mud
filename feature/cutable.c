// cutable.c

#include <ansi.h>
#include <dbase.h>

#define LEVEL           0
#define UNIT            1
#define NAME            2
#define NAME_LEFT       3
#define ID_LEFT         4
#define ASS_PART        5
#define VERB            6
#define CLONE           7

#define NOT_INCLUDE_THIS_PART   0
#define INCLUDE_THIS_PART       1

int is_cutable() { return 1; }

void include_part(object ob, string id, mixed *in_part, int include_this_part);

string *query_exclude_part() { return ({ }); }

int do_cut(object me, string arg)
{
        string *exist;
        string *cut;
        mapping parts;
        mixed *part;
        string default_clone;
        string msg;
        object weapon;
        object ob;

        if (! arg)
                return notify_fail("你要割下什么部位？\n");

        if (! mapp(parts = query("parts")))
                return notify_fail("看来你是割不下来什么东西了。\n");

        exist = keys(parts);
        exist -= query_exclude_part();
        cut = query("been_cut");
        if (! cut) cut = ({ });

        if (arg == "?")
        {
                int i;
                int count;
                count = 0;
                msg = this_object()->name() + "有以下部位可以割下来。\n";
                for (i = 0; i < sizeof(exist); i++)
                {
                        if (member_array(exist[i], cut) != -1 ||
                            query("no_cut/" + exist[i]))
                                continue;
                        count++;
                        msg += sprintf("%-20s(%s)\n",
                                       parts[exist[i]][NAME], exist[i]);
                }
                if (! count)
                        msg = this_object()->name() + "已经没什么可以下刀的地方了。\n";
                write(msg);
                return 1;
        }

        part = parts[arg];
        if (! arrayp(part))
                return notify_fail("你怎么也找不到你想割的部位。\n");

        if (member_array(arg, cut) != -1)
                return notify_fail(part[NAME] + "已经被割走了。\n");

        if (msg = query("no_cut/" + arg))
                return notify_fail(msg ? msg : "这样东西你割不下来。\n");

        default_clone = query("default_clone");
        if (weapon = me->query_temp("weapon"))
        {
                if (weapon->query("skill_type") == "pin")
                {
                        if (me->query_skill("sword") < 100)
                                return notify_fail("你现在的修为尚且无法用针进行切割。\n");
                        else
                                msg = WHT "$N" WHT "轻弹出手中" + weapon->name() +
                                      WHT "，勾勒出一道绚丽的弧芒，将$n" WHT "的" +
                                      part[NAME] + WHT "割了下来。\n" NOR;
                } else
                if (weapon->query("skill_type") == "hammer")
                {
                        if (me->query_skill("hammer") < 100)
                                return notify_fail("你现在的锤法修为尚且无法进行切割。\n");
                        else
                                msg = WHT "$N" WHT "蓦地挥动" + weapon->name() +
                                      WHT "，听得「哐咚」一声闷响，已将$n" WHT "的"
                                      + part[NAME] + WHT "砸了下来。\n" NOR;
                } else
                if (weapon->query("skill_type") == "staff")
                {
                        if (me->query_skill("staff") < 100)
                                return notify_fail("你现在的杖法修为尚且无法进行切割。\n");
                        else
                                msg = WHT "$N" WHT "反转过手中" + weapon->name() +
                                      WHT "，只听「嗤啦」一声，已将" + part[NAME] +
                                      WHT "从$n" WHT "上割了下来。\n" NOR;
                } else
                if (weapon->query("skill_type") == "club")
                {
                        if (me->query_skill("club") < 100)
                                return notify_fail("你现在的棍法修为尚且无法进行切割。\n");
                        else
                                msg = WHT "$N" WHT "高举过手中" + weapon->name() +
                                      WHT "凌空劈下，随着「噗嗤」一声，已将" +
                                      part[NAME] + WHT "从$n" WHT "上劈了下来。\n" NOR;
                } else
                if (weapon->query("skill_type") == "whip")
                {
                        if (me->query_skill("whip") < 100)
                                return notify_fail("你现在的鞭法修为尚且无法进行切割。\n");
                        else
                                msg = WHT "$N" WHT "一振手中" + weapon->name() +
                                      WHT "，顿时只听「噼」的一声脆响，已将$n" WHT
                                      "的" + part[NAME] + WHT "卷了下来。\n" NOR;
                } else
                msg = WHT "$N" WHT "提起手中" + weapon->name() +
                      WHT "「嗤」的一声便将$n" WHT "的" + part[NAME] +
                      (stringp(part[VERB]) ? part[VERB] : WHT "割了下") +
                      WHT "来。\n" NOR;
        } else
        if (me->query_skill("force") < 90)
        {
                message_vision(WHT "$N" WHT "举起手来，对着$n" WHT "的" +
                               part[NAME] + WHT "一掌砍了下去，结果被震"
                               "的「哇哇」怪叫了两声。\n" NOR, me, this_object());

                write(HIY "好好练练内功再来吧。\n" NOR);
                return 1;
        } else
                msg = WHT "$N" WHT "举起手来，一下子就把$n" WHT "的" + part[NAME] +
                      WHT "给" + (stringp(part[VERB]) ? part[VERB] : "切了下") +
                      WHT "来。\n" NOR;

        message_vision(msg, me, this_object());

        // 割了头的尸体取消掉户主
        if (arg == "head")
                this_object()->delete("defeated_by");

        ob = new(stringp(part[CLONE]) ? part[CLONE] : default_clone);
        ob->set_name(stringp(part[NAME_LEFT]) ? part[NAME_LEFT] : part[NAME],
                     ({ stringp(part[ID_LEFT]) ? part[ID_LEFT] : arg }));
        ob->set("unit", part[UNIT]);
        ob->set("long", "这是一" + part[UNIT] + "被人割下来的" + ob->name() + "。\n");
        ob->set("default_clone", default_clone);
        ob->set("main_part_level", part[LEVEL] + 1);

        if (ob->is_cutable())
                ob->set("been_cut", ({ }));

        ob->set_from(this_object());

        if (me->query("env/auto_get"))
        {
                message_vision("$N拣起一" + ob->query("unit") +
                               ob->name() + "。\n", me);
                ob->move(me, 1);
        } else
                ob->move(environment());

        // seperate the part cut
        cut += ({ arg });
        set("been_cut", cut);

        // seperate the association part
        include_part(ob, arg, 0, NOT_INCLUDE_THIS_PART);
        return 1;
}

string extra_desc()
{
        string msg;
        string *cut;
        mixed *part;
        int flag;
        int i;

        msg = "";
        if (! arrayp(cut = query("been_cut")))
                return msg;
        flag = 0;
        for (i = 0; i < sizeof(cut); i++)
        {
                part = query("parts/" + cut[i]);
                if (part[LEVEL] > query("main_part_level"))
                        continue;
                if (! flag)
                {
                        msg += "不过它的" + part[NAME];
                        flag++;
                } else
                        msg += "、" + part[NAME];
        }
        if (flag) msg += "已经不见了。\n";
        return msg;
}

void include_part(object ob, string id, mixed *in_part, int include_this_part)
{
        string *cut;
        string *ass;
        mixed  *srcpart;
        mixed  *part;
        string new_id;
        mapping assmap;
        int i;

        srcpart = query("parts/" + id);
        if (! arrayp(srcpart))
                return;
        part = allocate(sizeof(srcpart));
        for (i = 0; i < sizeof(srcpart); i++)
                part[i] = srcpart[i];
        part[ASS_PART] = allocate_mapping(sizeof(srcpart[ASS_PART]));
        if (include_this_part)
        {
                part[NAME] = part[NAME_LEFT];
                new_id = in_part[ASS_PART][id];
                ob->set("parts/" + new_id, part);
                if (member_array(id, cut = query("been_cut")) != -1)
                        ob->set("been_cut", ob->query("been_cut") + ({ new_id }));
                set("been_cut", cut + ({ id }));
        }

        if (mapp(assmap = srcpart[ASS_PART]))
        {
                // set the association part
                ass = keys(assmap);
                for (i = 0; i < sizeof(ass); i++)
                {
                        include_part(ob, ass[i], srcpart, INCLUDE_THIS_PART);
                        new_id = assmap[ass[i]];
                        part[ASS_PART][new_id] = new_id;
                        if (query("no_cut/" + ass[i]))
                                ob->set("no_cut/" + new_id, query("no_cut/" + ass[i]));
                }
        }
}
