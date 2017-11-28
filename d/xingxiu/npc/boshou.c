#include <ansi.h>
inherit NPC;

void create()
{
        set_name("星宿派钹手", ({ "bo shou", "bo", "shou" }));
        set("long", "他手中拿着一对铜钹，一边敲一边扯着\n"
                    "嗓子唱些肉麻的话。\n");
        set("gender", "男性");
        set("age", 33);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 26);
        set("int", 16);
        set("con", 22);
        set("dex", 24);

        set("max_qi", 200);
        set("max_jing", 200);
        set("neili", 200);
        set("max_neili", 200);
        set("jiali", 10);
        set("combat_exp", 2000);

        set_skill("force", 20);
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set_skill("parry", 20);

        setup();
        set("chat_chance", 10);
        set("chat_msg", ({
		CYN "钹手敲着铜钹，高声唱道：星～宿～老～仙～威～震～寰～宇。\n" NOR,
		CYN "钹手敲着铜钹，高声唱道：星～宿～老～仙～德～配～天～地。\n" NOR,
		CYN "钹手敲着铜钹，高声唱道：星～宿～老～仙～古～今～无～比。\n" NOR,
        }));
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/d/xingxiu/obj/tongbo")->wield();
}
