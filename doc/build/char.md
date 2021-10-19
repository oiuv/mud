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
inherit F_ACTION; // 行动控制模块，包括busy状态的实现
inherit F_ALIAS; // 玩家别名模块，包括指令限制和别名设置
inherit F_APPRENTICE; // 门派师徒模块，包括create_family和is_apprentice_of等方法
inherit F_ATTACK; // 战斗模块，包括attack等方法，在心跳中调用实现战斗功能
inherit F_ATTRIBUTE; // 属性模块，计算角色属性
inherit F_COMMAND; // 指令模块，控制角色指令权限
inherit F_CONDITION; // 状态模块，控制生物的增益状态，如中毒
inherit F_DAMAGE; // 伤害模块，配合战斗模块使用，包括重要的die方法
inherit F_DBASE; // 数据存取模块，包括重要的set/add/delete等方法
inherit F_EDIT; // ed编辑模块，在线编辑发贴等功能使用
inherit F_FINANCE; // 资金管理模块，包括can_afford和pay_money二个方法
inherit F_MESSAGE; // 消息处理模块，包括核心的receive_message方法等
inherit F_MORE; // 分页显示模块，处理长消息分页显示
inherit F_MOVE; // 移动控制模块
inherit F_NAME; // 名称模块，包括id、short、long等方法
inherit F_SKILL; // 技能管理模块，包括set_skill、improve_skill等方法
inherit F_SHELL; // 管理员测试代码用
inherit F_TEAM; // 组队管理模块
```

这里继承的功能非常多，请自己查阅`/include/char`目录下的相关文件和继承的`feature`目录下的相关文件。

玩家对象`USER_OB`文件为`/clone/user/user.c`，如果要对玩家角色做开发，请在这个文件中修改，或者让这个文件继承你开发的模块。而对普通NPC的开发，只用在代码中`inherit NPC;`即可。

以下为一个基本的NPC示例：

```c
inherit NPC;

void create()
{
    set_name("官兵", ({ "guan bing", "guan", "bing" }));
    setup();
}
```

以上代码实现的角色拥有默认的初始状态，也可以正常的加载到游戏环境中。`set_name`是F_NAME模块的实现的方法，用来设置对象的名称和ID，`setup`是CHARACTER中实现的方法，用来初始化角色并激活生物状态。

下面代码是进一步完善的NPC角色，增加了描述、技能、属性和装备等。

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

`create()` apply方法中的函数都是通过继承的`NPC`对象模块来实现的。其中`set`和`set_temp`方法是`F_DBASE`模块中实现，用来设置数据。`set_skill`方法是`F_SKILL`模块中实现的，用来设置技能。`setup()`为`CHARACTER`模块中实现，用来设置心跳和激活角色，这个方法千万不要漏写了。`carry_object`方法是`NPC`模块中实现的方法，用了加载指定对象到NPC身上。

需要说明的是`chat_chance_combat`和`chat_msg_combat`，这个是在NPC模块中实现的`chat()`方法调用的，角色每次心跳都会调用NPC的`scan()`方法，这个方法会呼叫`chat()`方法，方法代码如下：

```c
int chat()
{
    string *msg;
    int chance, rnd;

    if (is_busy())
        return 0;

    if (! chance = (int)query(is_fighting()? "chat_chance_combat": "chat_chance"))
        return 0;

    if (arrayp(msg = query(is_fighting()? "chat_msg_combat": "chat_msg")))
    {
        if (random(100) < chance)
        {
            rnd = random(sizeof(msg));
            if (stringp(msg[rnd]))
                say(msg[rnd]);
            else if (functionp(msg[rnd]))
                return evaluate(msg[rnd]);
        }
        return 1;
    }
}
```

除了NPC外，还有CHALLENGER、FIGHTER、INSECT、KNOWER、SNAKE等特定的角色，可以根据开发继承使用，如果你要开发的生物对象是蛇类，直接`inherit SNAKE;`。

建议二次开发时先查看NPC模块中封装了哪些功能，多看看其它代码中的示例，并自己测试熟悉。
