// mawude.c

#include <ansi.h>

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("马五德", ({ "ma wude", "ma" }));
        set("title","金牛武馆馆长");
        set("long", "马老爷子是武馆的缔造者，辛苦一辈子了，仍勇于提携后生。\n");
        set("gender", "男性");
        set("age", 65);

        set_skill("dodge", 180);
        set_skill("force", 180);
        set_skill("parry", 180);
        set_skill("unarmed", 180);
        set_skill("hand", 180);
        set_skill("whip", 180);
        set_temp("apply/attack", 80);
        set_temp("apply/defense", 80);
        set_temp("apply/damage", 20);

        set("combat_exp", 600000);
        set("shen_type", 1);
        setup();

        carry_object("/clone/book/advance-sword");
        carry_object("/clone/book/advance-sword");
        carry_object("/clone/book/advance-sword");
        carry_object("/clone/book/advance-sword");
        carry_object("/clone/book/advance-sword");
        carry_object("/clone/book/advance-blade");
        carry_object("/clone/book/advance-blade");
        carry_object("/clone/book/advance-blade");
        carry_object("/clone/book/advance-blade");
        carry_object("/clone/book/advance-blade");
        carry_object("/clone/book/advance-dagger");
        carry_object("/clone/book/advance-dagger");
        carry_object("/clone/book/advance-dagger");
        carry_object("/clone/book/advance-dagger");
        carry_object("/clone/book/advance-dagger");
        carry_object("/clone/book/advance-unarmed");
        carry_object("/clone/book/advance-unarmed");
        carry_object("/clone/book/advance-unarmed");
        carry_object("/clone/book/advance-unarmed");
        carry_object("/clone/book/advance-unarmed");
        carry_object("/clone/book/advance-dodge");
        carry_object("/clone/book/advance-dodge");
        carry_object("/clone/book/advance-dodge");
        carry_object("/clone/book/advance-dodge");
        carry_object("/clone/book/advance-dodge");
        carry_object("/clone/book/advance-parry");
        carry_object("/clone/book/advance-parry");
        carry_object("/clone/book/advance-parry");
        carry_object("/clone/book/advance-parry");
        carry_object("/clone/book/advance-parry");
        carry_object("/clone/book/advance-force");
        carry_object("/clone/book/advance-force");
        carry_object("/clone/book/advance-force");
        carry_object("/clone/book/advance-force");
        carry_object("/clone/book/advance-force");
        carry_object("/clone/book/advance-staff");
        carry_object("/clone/book/advance-staff");
        carry_object("/clone/book/advance-staff");
        carry_object("/clone/book/advance-staff");
        carry_object("/clone/book/advance-staff");
        carry_object("/clone/book/advance-whip");
        carry_object("/clone/book/advance-whip");
        carry_object("/clone/book/advance-whip");
        carry_object("/clone/book/advance-whip");
        carry_object("/clone/book/advance-whip");
        carry_object("/clone/book/advance-throwing");
        carry_object("/clone/book/advance-throwing");
        carry_object("/clone/book/advance-throwing");
        carry_object("/clone/book/advance-throwing");
        carry_object("/clone/book/advance-throwing");
}

void init()
{
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}

int recognize_apprentice(object ob)
{
        if (! (int)ob->query_temp("marks/jinniu_paied") == 1) return 0;
        return 1;
}

