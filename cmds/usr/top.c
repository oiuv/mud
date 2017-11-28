// top.c

#include <ansi.h> 
#include <mudlib.h>

inherit ITEM;

int top_list(object ob1, object ob2);
int get_score(object ob);


void init()
{
        add_action("do_view", "view");
}

int main(string arg)
{
        object *list, *ob, me;
        int i;
        string msg;

        me = this_player();

        

        // 防止系统资源消耗过大，限时浏览。
        if (! wizardp(me) && time() - me->query_temp("last_view") < 60)
                return notify_fail(HIW "\n突然间英雄壁上一道光华闪过，使你"
                                   "难以辨清壁上的字迹。\n" NOR);

        ob = filter_array(objects(), (: userp($1) && ! wizardp($1) :));
        list = sort_array(ob, (: top_list :));

        msg =  HIW "\n            ┏━━『" HIG " 英 雄 壁 " HIW "』━━┓\n";
        msg += "┏━━━┯━┻━━━━━━━━┯━━┻━┯━━━━┓\n";
        msg += "┃ " HIG "排行" HIW " │    " HIG "姓        名" HIW
               "    │ " HIG "门  派" HIW " │ " HIG "评  价" HIW " ┃\n";
        msg += "┠───┴──────────┴────┴────┨\n";

        for (i = 0; i < 10; i++)
        {
                if (i >= sizeof(list)||list[i]->query("id") == 0||get_score(list[i]) < 10)	//ivy
                {
                        msg += HIW "┃        暂时空缺              无             -  ┃\n" NOR;
                        continue;
                }
                msg += sprintf(HIW "┃" HIG "  %-5s %-22s%-10s %5d  " HIW "┃\n" NOR,
                        chinese_number(i + 1),
                        list[i]->query("name") + "(" +
                        capitalize(list[i]->query("id")) + ")",
                        list[i]->query("family") ?
                        list[i]->query("family/family_name") : "江湖浪人",
                        get_score(list[i]));
        }
        msg += HIW "┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n" NOR;
        msg += HIG + NATURE_D->game_time() + "记。\n" NOR;
        msg += WHT "英雄壁下面有一行小字刻着：" + me->query("name") + "，目前评价：" +
               get_score(me) + "。\n\n" NOR;

        write(msg);
        me->set_temp("last_view", time());
        return 1;

}

int top_list(object ob1, object ob2)
{
        int score1, score2;

        score1 = get_score(ob1);
        score2 = get_score(ob2);

        return score2 - score1;
}

int get_score(object ob)
{
        //int tlvl, i, score;
        int tlvl, score;
        //string *ski;
        //mapping skills;

        reset_eval_cost();
        
        /*
        //取消技能的加分权重，使评分更加合理并减轻系统负担
        skills = ob->query_skills();

        if (! sizeof(skills))
                return 1; 

        ski  = keys(skills);
        for(i = 0; i < sizeof(ski); i++)
        {
                tlvl += skills[ski[i]];
        }
        score = tlvl / 15;
        */
        //评分增加dodge,parry,force,martial-cognize
        tlvl=(int)ob->query_skill("force",1) + (int)ob->query_skill("dodge",1) +(int)ob->query_skill("parry",1) + (int)ob->query_skill("martial-cognize",1);
        score = tlvl;
        score += ob->query("max_neili") / 30;
        score += ob->query("max_jingli") / 30;
        score += ob->query_str() +
                 ob->query_int() +
                 ob->query_dex() +
                 ob->query_con() - 80;
        score += (int)ob->query("combat_exp") / 5000;
        return score;
}
