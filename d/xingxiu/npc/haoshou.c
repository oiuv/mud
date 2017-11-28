#include <ansi.h>
inherit NPC;

void create()
{
        set_name("星宿派号手", ({ "hao shou", "hao", "shou" }));
        set("long", "他手中拿着一只铜号，鼓足力气沉醉地\n"
                    "吹着。\n");
        set("gender", "男性");
        set("age", 33);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 26);
        set("int", 16);
        set("con", 22);
        set("dex", 24);

        set("max_qi", 300);
        set("max_jing", 300);
        set("neili", 300);
        set("max_neili", 300);
        set("jiali", 10);
        set("combat_exp", 3000);

        set_skill("force", 30);
        set_skill("dodge", 30);
        set_skill("unarmed", 30);
        set_skill("parry", 30);

        setup();
        set("chat_chance", 10);
        set("chat_msg", ({
		CYN "号手吹着铜号，高声唱道：星～宿～老～仙～威～震～寰～宇。\n" NOR,
		CYN "号手吹着铜号，高声唱道：星～宿～老～仙～德～配～天～地。\n" NOR,
		CYN "号手吹着铜号，高声唱道：星～宿～老～仙～古～今～无～比。\n" NOR,
        }));
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/d/xingxiu/obj/tonghao")->wield();
}
