// story:sun 日炽

#include <ansi.h>

inherit F_CLEAN_UP;

mixed random_gift();

STATIC_VAR_TAG mixed *story = ({
        "后羿：哪里跑！",
        "金乌：糟糕，这下避无可避，该怎么办？",
        "后羿：看箭！",
        "「嗖——」",
        "金乌：天杀的，今天就和你拼了！",
        "后羿：早该如此，看我的「百步穿阳」！",
        "金乌：「毁灭之光」！",
        "「嗖——嗖——」",
        "金乌：哎呦……",
        "「哧啦——哧啦——」",
        "后羿抹了抹汗：好险！",
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
        
        if (ob->query("gift/sun") || random(5))
        {
                msg = HIR + ob->name(1) + "一声惨叫，软软的倒了下去。" NOR;
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
                msg = HIY "霎那间" + ob->name(1) +
                      HIY "浑身金光闪闪，如沐金涛，神威凛凛。" NOR;
                ob->add("str", 1);
                ob->add("gift/sun", 1);
        }
        return msg;
}

