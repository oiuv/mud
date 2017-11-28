// Inherit: insect.c 毒虫

#include <ansi.h>
inherit NPC;

int is_insect() { return 1; }

void setup()
{
        mapping p;

        // 毒虫具有毒性等级和毒量

        p = this_object()->query("insect_poison");
        if (! p)
        {
                ::setup();
                return;
        }

        if (! intp(p["level"]))   p["level"]   = 10 + random(40);
        if (! intp(p["remain"]))  p["remain"]  = 10 + random(40);
        if (! stringp(p["id"]))   p["id"]      = "nature insect";

        ::setup();
}

void init()
{
        object me, ob;

        ::init();
        if (! interactive(me = this_player()))
                return;

        remove_call_out("disappear");
        call_out("disappear", 3);
}

void disappear()
{
        if (living(this_object()))
        {
                message_vision("$N溜走了。\n", this_object());
                destruct(this_object());
        }
}

varargs void revive(int quiet)
{
        object env;

        if (quiet)
        {
                ::revive();
                return;
        }

        env = environment(this_object());
        while (env && ! userp(env))
                env = environment(env);

        if (env)
        {
                tell_object(env, "你觉得身上有点不对劲，好像是"
                            "跑掉了什么东西。\n");
        } else
        {
                message_vision("$N醒了过来，抖了抖身体，呼啦一下子就消失了。\n",
                               this_object());
                return;
        }

        destruct(this_object());
}
