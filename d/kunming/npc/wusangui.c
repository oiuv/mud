#include <ansi.h>
inherit NPC;

void create()
{
        set_name("吴三桂", ({ "wu sangui", "wu" }));
        set("age", 58);
        set("title", HIY "平西王" NOR);
        set("gender", "男性");
        set("long", "这就是大名鼎鼎的引清兵入关的平西王吴三桂\n");
        set("attitude", "peaceful");
        set("str", 30);
        set("dex", 30);
        set("max_neili", 500);
        set("neili", 500);
        set("max_jing", 600);
        set("max_qi", 1200);
        set("combat_exp", 3000000);
        set("shen_type", -1);

        set_skill("unarmed", 120);
        set_skill("dodge", 120);
        set_skill("parry", 120);
        set_skill("hammer", 120);
        set_skill("gun", 120);
        set_skill("force", 120);
        map_skill("hammer", "gun");

        set_temp("apply/attack", 300);
        set_temp("apply/defense", 300);
        set_temp("apply/damage", 300);
        set_temp("apply/armor", 300);

        setup();
        carry_object(__DIR__"obj/huoqiang")->wield();
        carry_object("/d/beijing/npc/obj/goldcloth2")->wear();
}

void init()
{
        object ob;

        ::init();

        if (interactive(ob = this_player()) && ! is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        string startroom;

        if (! objectp(ob) || environment(ob) != environment()) return;

        if (stringp(startroom = query("startroom")) &&
            find_object(startroom) == environment())
        {
                say(CYN "吴三桂喝道：“什么人！居然敢擅闯本王府！”\n\n" NOR +
                    HIR "只见吴三桂举手一抬，听得“轰”的一声，一团火焰从枪口窜出。\n" NOR);
                tell_object(ob, HIR "你躲避不及，只觉胸口一阵剧疼，鲜血狂涌而出！\n" NOR);
                ob->receive_wound("qi", 90);
        } else
                say(CYN "吴三桂瞪着你，磨了磨牙。\n" NOR);
}

void unconcious()
{
        die();
}

