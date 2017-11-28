inherit NPC;
#include <ansi.h>;

void create()
{
        set_name("公孙绿萼", ({ "gongsun lve", "gongsun", "lve" }) );      
        set("nickname", HIC "绝情谷主女儿" NOR);
        set("gender", "女性");
        set("long", @LONG
她就是绝情谷主的女儿公孙绿萼，只见她长
挑身材、脸色白嫩、嘴角旁有颗小痣，自有
一股清新脱俗之气。
LONG);

        set("age", 18);
        set("attitude", "peaceful");
        set("per", 26);
        set("str", 14);
        set("con", 14);
        set("dex", 14);
        set("int", 14);

        set("neili", 200);
        set("max_neili", 200);
        set("jiali", 60);
        set("max_qi",800);
        set("max_jing",600);
        set("combat_exp", 400000);
        set("shen_type", 1);

        set_skill("sword", 80);
        set_skill("force", 80);
        set_skill("parry", 80);
        set_skill("dodge", 80);
        set_skill("strike", 80);
        set_skill("jueqing-jian", 80);
        set_skill("jueqing-shenfa", 80);
        set_skill("jueqing-xinfa", 80);

        map_skill("sword", "jueqing-jian");
        map_skill("parry", "jueqing-jian");
        map_skill("dodge", "jueqing-shenfa");
        map_skill("force", "jueqing-xinfa");
    
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/jueqing/npc/obj/lvshan")->wear();
}

