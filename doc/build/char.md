## 游戏生物的开发

游戏中的对象除了环境外，更多的是玩家、NPC、动物等有生命的角色（生物）和装备、道具等无生命的物品。

### 生物的本质

在游戏中，一个对象是否是有生命的并不是取决于是否有HP等属性，HP只是开发者对生物赋于的特殊属性，对一块石头，你也可以设置HP。也不是取决于这个对象是否有心跳，任何对象都可以设置心跳。

对象是否是生物的核心在于这个对象是否调用了`enable_commands()`这个外部函数，当对象调用这个指令后就允许对象使用玩家命令，同时也被系统认定为生物，使用`living()`外部函数判断返回为1，也会加在`livings()`对象列表中。

如下代码，就实现了一个生物，而且可以通过`find_living("test")`外部函数找到这个生物。

```c
void create()
{
    enable_commands();
    set_living_name("test");
}
```

### 游戏角色的开发

以上代码只是实现了一个没什么用的生物对象，啥也不是。而我们在游戏开发中需要一个生物可能以下功能：有属性、可移动、有技能、可战斗、能交流、可组队等等。

对这些基础功能，我们在炎黄MUD中不需要自己从零实现，直接继承使用`inherit CHARACTER;`，玩家对象`USER_OB`和非玩家对象`NPC`都继承了这个模块。而`CHARACTER`模块又继承了大量的功能模块：

```c
inherit F_ACTION;
inherit F_ALIAS;
inherit F_APPRENTICE;
inherit F_ATTACK;
inherit F_ATTRIBUTE;
inherit F_COMMAND;
inherit F_CONDITION;
inherit F_DAMAGE;
inherit F_DBASE;
inherit F_EDIT;
inherit F_FINANCE;
inherit F_MESSAGE;
inherit F_MORE;
inherit F_MOVE;
inherit F_NAME;
inherit F_SKILL;
inherit F_SHELL;
inherit F_TEAM;
```

这里继承的功能非常多，请自己查阅`/include/char`目录下的相关文件和继承的`feature`目录下的相关文件。

玩家对象`USER_OB`文件为`/clone/user/user.c`，如果要对玩家角色做开发，请在这个文件中修改，或者让这个文件继承你开发的模块。而对普通NPC的开发，只用在代码中`inherit NPC;`即可。

以下为一个基本的NPC示例：

```
#include <ansi.h>
inherit NPC;

void create()
{
        set_name("官兵", ({ "guan bing", "guan", "bing" }));
        set("age", 22);
        set("gender", "男性");
        set("long", "虽然官兵的武艺不能和武林人士相比，可"
                    "是他们讲究的是人多力量大。\n");
        set("attitude", "peaceful");

        set("str", 24);
        set("dex", 16);
        set("combat_exp", 10000);
        set("shen_type", 1);

        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);
        set_skill("blade", 40);
        set_skill("force", 40);
        set_temp("apply/attack", 40);
        set_temp("apply/defense", 40);
        set_temp("apply/damage", 20);
        set_temp("apply/armor", 40);

        set("chat_chance_combat", 10);
        set("chat_msg_combat", ({
                CYN "官兵喝道：大胆刁民，竟敢造反不成？\n" NOR,
                CYN "官兵喝道：跑得了和尚跑不了庙，你还是快快束手就擒！\n" NOR,
        }));
        setup();
        carry_object("/clone/weapon/blade")->wield();
        carry_object("/clone/cloth/junfu")->wear();
}
```

`create()` apply方法中的函数都是通过继承的`NPC`对象模块来实现的。其中`set`和`set_temp`方法是`F_DBASE`模块中实现，用来设置数据。`set_skill`方法是`F_SKILL`模块中实现的，用来设置技能。`setup()`为`CHARACTER`模块中实现，用来设置心跳和激活角色。`carry_object`方法是`NPC`模块中实现的方法，用了加载指定对象到NPC身上。
