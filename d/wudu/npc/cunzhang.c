// cuihua.c

inherit NPC;

void create()
{
        set_name("苗三斤",({ "miao sanjin","miao"}) );
        set("gender", "男性" );
        set("age", 58);
        set("long", "这是本村的村长，凡是村里各家各户，老老少少的事他没有不知道的。\n");

        set("max_qi", 300);
        set("shen_type", 1);
        set("str", 20);
        set("dex", 20);
        set("con", 20);
        set("int", 20);
        set("combat_exp", 800);
        set_temp("apply/attack", 10);
        set_temp("apply/defense", 20);
        set("attitude", "peaceful");
        set("chat_chance",10);
        set("chat_msg",({
                   "村长叹道：翠兰的爹爹到现在还没回来，会不会出事啊。\n",
                   "村长自言自语道：天天到那种地方去，早晚要出事的。\n",
        }));

        setup();
        carry_object("/d/city/obj/cloth")->wear();
        carry_object(__DIR__"obj/hanyan");
        add_money("coin", 50);
        set("inquiry", ([
                   "name": "我是苗三斤．因为村里我酒量最大，所以大家选我当了村长。\n",
                   "here": "此乃桃花村也。\n",
                   "桃花峪": "你问桃花峪啊，那可是个鬼地方，据说山谷里有瘴气，进去的人都死了。\n",
        ]) );

}
