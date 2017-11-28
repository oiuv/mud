#include <ansi.h>
inherit NPC;

void create()
{
        set_name("康亲王", ({ "kang qinwang", "kang"}));
        set("title", HIY "当朝亲王" NOR);
        set("gender", "男性" );
        set("age", 42);
        set("long", "\n只见他一身锦衣，笑容满面，任谁见了他都生不起气来。\n"+
		      "此人深谙为官之道，极善察言观色、溜须拍马，颇得皇帝\n欢心。\n");
        set("shen_type", 1);
        set("combat_exp", 50000);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
        set("attitude", "peaceful");
        set_skill("dodge", 50);
        set_skill("unarmed", 50);

        setup();
        carry_object("/d/beijing/npc/obj/goldcloth2")->wear();
}
