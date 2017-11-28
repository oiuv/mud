// story:feng 凤舞

#include <ansi.h>

mixed random_gift();

inherit F_CLEAN_UP;

STATIC_VAR_TAG mixed *story = ({
        "路人：这位大哥，这附近最近有什么奇怪的事情发生吗？",
        "樵夫：听说最近东边的湖畔经常会飞来一只凤凰。",
        "路人：原来真有这事....",
        "樵夫：唉！又是个来送死的。",
        "路人：听说上回老五看到了凤凰起舞，结果身法大涨，现在寻常人都打不过他了。",
        "......",
        "湖边，凤凰看着水中的倒影，陶醉在自己的美丽中，翩翩起舞。",
        "周围随着凤舞刮起了旋风。",
        "呼～～～～",
        (: random_gift :),
});

void create()
{
        seteuid(getuid());
}

string prompt() { return HIR "【天灾人祸】" NOR; }

mixed query_story_message(int step)
{
        return step < sizeof(story) ? story[step] : 0;
}

mixed random_gift()
{
        object *obs;
        object ob;
        string msg;

        obs = filter_array(all_interactive(), (: ! wizardp($1) &&
                                                 environment($1) &&
                                                 environment($1)->query("outdoors") &&
                                                 ! $1->query("doing") :));
        if (! sizeof(obs))
                return 0;

        ob = obs[random(sizeof(obs))];
        
        if (ob->query("gift/feng") || random(5))
        {
                msg = HIR + ob->name(1) + "被一阵旋风刮起，重重摔在了地上。" NOR;
                if (ob->query("combat_exp") < 1000000 ||
                    ob->query("qi") < 1000)
                        ob->unconcious();
                else
                {
                        ob->set("qi", 10);
                        ob->set("eff_qi", 10);
                        ob->set("jing", 1);
                        ob->set("eff_jing", 1);
                }
        } else
        {
                msg = HIG "听说" + ob->name(1) +
                      HIG "无意中看到了凤凰起舞。" NOR;
                ob->add("dex", 1);
                ob->add("gift/feng", 1);
        }
        return msg;
}

