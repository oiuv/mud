inherit NPC;
#include <ansi.h>;

void create()
{
        set_name("尼姑", ({ "ni gu", "ni", "gu" }) );
        set("gender", "女性" );
        set("age", 32);
        set("long","这位尼姑正坐在铺垫上，双手捻着珠链，嘴中念念有词。 \n");
        set("combat_exp", 1000);
        set("attitude", "friendly");
        setup();
}

