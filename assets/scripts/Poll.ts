import { _decorator, Prefab, Node, instantiate, NodePool } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Pool')
export class Pool {
	private pool: NodePool;
	private readonly prefab: Prefab;

	constructor(prefab: Prefab, counter: number) {
		this.pool = new NodePool();
		this.prefab = prefab;
		for (let i = 0; i < counter; i++) {
			const node = instantiate(prefab);
			this.pool.put(node);
		}
	}

	get(): Node {
		if (this.pool.size() > 0) {
			return this.pool.get();
		} else {
			const obj = instantiate(this.prefab);
			return obj;
		}
	}

	release(orange: Node) {
		this.pool.put(orange);
	}

	size() {
		return this.pool.size();
	}
}
