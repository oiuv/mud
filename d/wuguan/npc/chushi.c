#include <ansi.h>;
inherit NPC;

void create()
{
        set_name("厨师", ({ "chu shi", "chu", "shi" }));
        set("long", "他是郭府的厨子，敦厚老实。你可以问他要(serve)些吃的。\n");
        set("gender", "男性");
        set("age", 65);
        set("combat_exp", 7500);
        set_skill("unarmed", 35);
        set_skill("force", 35);
        set_skill("dodge", 40);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 40);
        set("shen_type", 1);
        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_serve", "serve");
}

int do_serve()
{
        object me;
        object food;
        object water;
        me = this_player();

        if (present("rice", me)
           && present("tea", me))
                return notify_fail(CYN "厨师道：你身上不是还有么？吃完"
                                   "了再拿，别浪费食物。\n" NOR);

        if (objectp(present("rice", environment(me)))
           && objectp(present("tea", environment(me))))
                return notify_fail(CYN "厨师道：这周围不是还有么？吃完"
                                   "了再拿，别浪费食物。\n" NOR);


        message_vision(HIC "\n厨师将热气腾腾的饭菜递到$N" HIC "手中，笑"
                       "道：你慢用。\n\n" NOR, me);
        food = new("/d/wuguan/obj/rice");
        water = new("/d/wuguan/obj/tea");
        food->move(me);
        water->move(me);

        return 1; 
}
