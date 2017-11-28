// story:lighting 电击

#include <ansi.h>

mixed random_gift();

inherit F_CLEAN_UP;

STATIC_VAR_TAG mixed *story = ({
        "电母：这...这是啥？",
        "雷公：怎么了你？",
        "电母杏目圆睁：岂有此理！快说，你背地里都瞒着我干些什么？",
        "雷公：变态！",
        "电母：你...",
        "...",
        "嘿...",
        "哎呦...",
        "噼哑！！！！！！！！！！！～～～～～",
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
        
        if (ob->query("gift/lighting") || random(5))
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
                msg = HIC "霎那间" + ob->name(1) + "浑身火花四射，犹如天神一般，神威凛凛。" NOR;
                ob->add("con", 1);
                ob->add("gift/lighting", 1);
        }
        return msg;
}

