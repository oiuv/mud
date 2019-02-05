#include <ansi.h>

inherit KNOWER;
inherit F_DEALER;

void create()
{
    set_name("樵夫", ({ "qiao fu", "qiao", "fu" }));
    set("nickname", HIC "消息灵通" NOR);
    set("gender", "男性" );
    set("age", 50);
    set("long", @LONG
这是一个一辈子以砍材为生的老樵夫，由于饱
受风霜，显出与年龄不相称的衰老。
LONG);
    set("shen_type",1);
    set("combat_exp", 10000);
    set("str", 17);
    set("dex", 18);
    set("con", 18);
    set("int", 18);
    set("attitude", "friendly");
    setup();
    carry_object("/clone/misc/cloth")->wear();
    carry_object("/d/xiakedao/obj/knife")->wield();
}
