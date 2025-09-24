#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

// 从 masterd.c 获取有效技能类型
string *query_valid_types()
{
    return MASTER_D->query_valid_types();
}

#define HP_CMD              "/cmds/usr/hp"
#define SKILLS_CMD              "/cmds/skill/skills"
#define SHENYAN_NEILI_COST     400
#define SHENYAN_BUSY_TIME      2
#define SHENYAN_NEILI_REQUIRE  500

int is_scborn() { return 1; }

string name() { return HIC "通慧神眼" NOR; }

private int check_target(object me, string arg)
{
    object ob;

    if (! objectp(ob = present(arg, environment(me))))
        return notify_fail("这里没有这个人！格式：special shenyan <对象id>\n");

    if (ob->query_temp("apply/invisible"))
        return notify_fail("这里没有这个人！格式：special shenyan <对象id>\n");

    return 1;
}

string status_color(int current, int max)
{
    int percent;

    if (max > 0)
        percent = current * 100 / max;
    else
        percent = 100;

    if (percent > 100)
        return HIC;
    if (percent >= 90)
        return HIG;
    if (percent >= 60)
        return HIY;
    if (percent >= 30)
        return YEL;
    if (percent >= 10)
        return HIR;
    return RED;
}

private void show_target_status(object me, object ob)
{
    mapping my;
    string sp;
    int craze;

    my = ob->query_entire_dbase();

    if (userp(ob) && (!stringp(my["born"]) || !my["born"])) {
        tell_object(me, "还没有出生呐，察看什么？\n");
        return;
    }

    if (my["max_jing"] < 1 || my["max_qi"] < 1) {
        tell_object(me, "无法察看" + ob->name(1) + "的状态。\n");
        return;
    }

    sp = (ob == me ? "你" : ob->name()) + "目前的状态属性如下：\n";
    sp += HIC "≡" HIY "----------------------------------------------------------------" HIC "≡\n" NOR;

    sp += sprintf(HIC "【 精 气 】 %s%5d/ %5d %s(%3d%%)" HIC "    【 精 力 】 %s%5d / %5d (+%d)\n",
                  status_color(my["jing"], my["eff_jing"]), my["jing"], my["eff_jing"],
                  status_color(my["eff_jing"], my["max_jing"]),
                  my["eff_jing"] * 100 / my["max_jing"],
                  status_color(my["jingli"], my["max_jingli"]), my["jingli"],
                  my["max_jingli"], my["jiajing"]);

    sp += sprintf(HIC "【 气 血 】 %s%5d/ %5d %s(%3d%%)" HIC "    【 内 力 】 %s%5d / %5d (+%d)\n",
                  status_color(my["qi"], my["eff_qi"]), my["qi"], my["eff_qi"],
                  status_color(my["eff_qi"], my["max_qi"]),
                  my["eff_qi"] * 100 / my["max_qi"],
                  status_color(my["neili"], my["max_neili"]), my["neili"],
                  my["max_neili"], my["jiali"]);

    sp += sprintf(HIW "【 食 物 】 %s%5d/ %5d      " HIW "     【 潜 能 】  %s%d\n",
                  status_color(my["food"], ob->max_food_capacity()),
                  my["food"], ob->max_food_capacity(),
                  (int)ob->query("potential") >= (int)ob->query_potential_limit() ? HIM : HIY,
                  (int)ob->query("potential") - (int)ob->query("learned_points"));

    sp += sprintf(HIW "【 饮 水 】 %s%5d/ %5d      " HIW "     【 体 会 】  %s%d\n",
                  status_color(my["water"], ob->max_water_capacity()),
                  my["water"], ob->max_water_capacity(),
                  my["experience"] >= ob->query_experience_limit() ? HIM : HIY,
                  my["experience"] - my["learned_experience"]);

    if (craze = me->query_craze()) {
        if (me->is_most_craze())
            sp += HIR "【 愤 " BLINK "怒" NOR HIR " 】  " +
                  sprintf("%-22s", me->query("character") == "光明磊落" ? "竖发冲冠" : "怒火中烧");
        else
            sp += sprintf(HIR "【 愤 怒 】 %5d/ %5d (+%-3d)    ",
                          craze, me->query_max_craze(),
                          me->query("jianu"));
    } else {
        sp += HIC "【 平 和 】   ---------            ";
    }
    sp += sprintf(HIW "【 经 验 】  " HIC "%d\n", my["combat_exp"]);
    sp += HIC "≡" HIY "----------------------------------------------------------------" HIC "≡\n" NOR;
    tell_object(me, sp);
}

private void show_target_skills(object me, object ob)
{
    mapping skl, lrn, map;
    string *sname, *mapped, str, skillname, skcolor;
    string *basic;
    mixed  *lists;
    string *others;
    int i, k;
    int lvl;

    skl = ob->query_skills();
    if (! sizeof(skl)) {
        tell_object(me, (ob==me ? "你" : ob->name()) + "目前并没有学会任何技能。\n");
        return;
    }

    sname = keys(skl);
    str = (ob == me ? "你" : ob->name()) + "目前所学到的所有技能";

    basic = filter_array(query_valid_types(), (: member_array($1, $(sname)) != -1 :));
    lists = allocate(sizeof(basic));
    others = ({ });

    sname -= basic;
    for (i = 0; i < sizeof(sname); i++) {
        if (! sname[i]) continue;

        for (k = 0; k < sizeof(basic); k++) {
            string main_skill;

            if (SKILL_D(sname[i])->valid_enable(basic[k])) {
                if (! lists[k])
                    lists[k] = ({ sname[i] });
                else
                    lists[k] += ({ sname[i] });

                if (main_skill = SKILL_D(sname[i])->main_skill()) {
                    int st;
                    for (st = i + 1; st < sizeof(sname); st++)
                        if (sname[st] &&
                            SKILL_D(sname[st])->main_skill() == main_skill) {
                            lists[k] += ({ sname[st] });
                            sname[st] = 0;
                        }
                }
                break;
            }
        }

        if (k == sizeof(basic))
            others += ({ sname[i] });
    }

    sname = ({ });
    for (i = 0; i < sizeof(basic); i++) {
        sname += ({ basic[i] });
        if (lists[i]) sname += lists[i];
    }
    sname += others;

    map = ob->query_skill_map();
    if (mapp(map)) mapped = values(map);
    if (! mapped) mapped = ({});

    lrn = ob->query_learned();
    if (! mapp(lrn)) lrn = ([]);
    str += "\n\n";
    str += HIC "≡" HIY "------------------------------------------------------------" HIC "≡\n" NOR;

    for (i = 0; i < sizeof(sname); i++) {
        int percent;
        skillname = to_chinese(sname[i]);

        switch (strlen(skillname)) {
        case 3:
            skillname = sprintf("%c %c %c", skillname[0], skillname[1], skillname[2]);
            break;
        case 2:
            skillname = sprintf("%c    %c", skillname[0], skillname[1]);
            break;
        }

        if (member_array(sname[i], query_valid_types()) != -1)
            skcolor = CYN;
        else
            skcolor = WHT;

        if (! objectp(find_object(SKILL_D(sname[i]))) &&
            ! objectp(load_object(SKILL_D(sname[i])))) {
            tell_object(me, HIR "Error(No such skill):" + sname[i] + "\n" NOR);
            continue;
        }

        lvl = skl[sname[i]];
        percent = lrn[sname[i]] * 100 / ((lvl + 1) * (lvl + 1) + 1);
        if (percent > 100) percent = 100;
        str += sprintf("%s%s%s%-40s" NOR WHT " - %4d/%3d%%\n" NOR, skcolor,
            (lrn[sname[i]] >= (skl[sname[i]]+1) * (skl[sname[i]]+1)) ? HIM : "",
            (member_array(sname[i], mapped)==-1? "  ": "□ "),
            skillname + " (" + sname[i] + ")",
            lvl, percent);
    }

    str += HIC "≡" HIY "------------------------------------------------------------" HIC "≡\n" NOR;
    me->start_more(str);
}

int perform(object me, string skill, string arg)
{
    object ob;

    if (me->query("neili") < SHENYAN_NEILI_REQUIRE)
        return notify_fail("你内力不足，无法运用通慧神眼！\n");

    if (me->is_busy())
        return notify_fail("等你忙完再说吧！\n");

    if (check_target(me, arg) != 1)
        return 0;

    ob = present(arg, environment(me));

    write(HIW "你施展出通慧神眼之术 ……\n" NOR, me);

    me->add("neili", -SHENYAN_NEILI_COST);
    me->start_busy(SHENYAN_BUSY_TIME);

    show_target_status(me, ob);
    show_target_skills(me, ob);

    return 1;
}