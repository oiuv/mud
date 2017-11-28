#include <ansi.h>
inherit NPC;

void create()
{
        set_name("寡妇", ({ "gua fu", "gua", "fu" }));
        set("gender", "女性" );
        set("age", 25);
        set("long", "一个年轻漂亮又不甘寂寞的小寡妇。\n");
        set("shen_type", -1);
        set("combat_exp", 10000);
        set("str", 18);
        set("dex", 19);
        set("con", 19);
        set("int", 19);
        set("attitude", "friendly");
        set("chat_chance", 2);
        set("chat_msg", ({
                CYN "小寡妇哭着：我苦命的夫哇，你怎么撇下我不管了哟。\n" NOR,
                CYN "小寡妇抹了把眼泪，暗暗瞟了你一眼。\n" NOR,
        }));
        setup();
        carry_object("/clone/misc/cloth")->wear();
}
