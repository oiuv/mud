#include <ansi.h>
inherit NPC;
inherit F_BANKER;

void create()
{
        set_name("钱眼开", ({"qian yankai", "qian", "yankai"}));
        set("title", "钱庄老板");
        set("nickname", "铁公鸡");
        set("gender", "男性");
        set("age", 34);
        set("str", 22);
        set("int", 24);
        set("dex", 18);
        set("con", 18);
        set("qi", 500);
        set("max_qi", 500);
        set("jing", 100);
        set("max_jing", 100);
        set("shen", 0);

        set("combat_exp", 50000);
        set("shen_type", 1);
        set("attitude", "friendly");
        set("env/wimpy", 50);
        set("chat_chance", 1);
        set("chat_msg", ({
        	CYN "钱眼开骄傲的说道：本银号已经有上百年的历史，在江南可以说是第一家。\n" NOR,
                CYN "钱眼开笑着说道：在本店存钱无利息，取钱也不收手续费，客官您看着办吧。\n" NOR
        }));
        set_skill("unarmed", 50);
        set_skill("dodge", 50);
        set_temp("apply/attack", 100);
        set_temp("apply/defense", 100);
        set_temp("apply/damage", 40);
        setup();
}

void init()
{
        add_action("do_check", "check");
        add_action("do_check", "chazhang");
        add_action("do_convert", "convert");
        add_action("do_convert", "duihuan");
        add_action("do_deposit", "deposit");
        add_action("do_deposit", "cun");
        add_action("do_withdraw", "withdraw");
        add_action("do_withdraw", "qu");
}
